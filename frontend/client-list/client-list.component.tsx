import React from "react";
import { useFullWidth } from "../navbar/use-full-width.hook";
import PageHeader from "../page-header.component";
import ClientsTableToolbar from "./toolbar/clients-table-toolbar.component";
import ClientsTable from "./table/clients-table.component";
import easyFetch from "../util/easy-fetch";
import { SearchParseValues } from "../client-search/client-search-dsl.helpers";
import queryString from "query-string";

export default function ClientList(props: ClientListProps) {
  useFullWidth();
  const [apiState, dispatchApiState] = React.useReducer(
    reduceApiState,
    initialState
  );

  useAlwaysValidPage(apiState, dispatchApiState);
  useClientsApi(apiState, dispatchApiState);
  useFrontendUrlParams(apiState, dispatchApiState);

  const fetchingClient =
    apiState.status === ApiStateStatus.fetching ||
    apiState.status === ApiStateStatus.shouldFetch;

  return (
    <>
      <PageHeader title="Client list" fullScreen={true} />
      <ClientsTableToolbar
        numClients={apiState.apiData.pagination.numClients}
        page={apiState.page}
        pageSize={apiState.apiData.pagination.pageSize}
        setPage={newPage}
        setSearch={setSearch}
        fetchingClient={fetchingClient}
      />
      <ClientsTable
        clients={apiState.apiData.clients}
        fetchingClients={fetchingClient}
        page={apiState.page}
      />
    </>
  );

  function newPage(page: number) {
    dispatchApiState({
      type: ActionTypes.newPage,
      page
    });
  }

  function setSearch(search) {
    dispatchApiState({
      type: ActionTypes.newSearch,
      search
    });
  }
}

function reduceApiState(state: ApiState, action: ApiStateAction) {
  switch (action.type) {
    case ActionTypes.fetching:
      return {
        ...state,
        status: ApiStateStatus.fetching
      };
    case ActionTypes.fetched:
      return {
        ...state,
        status: ApiStateStatus.fetched,
        apiData: action.apiData
      };
    case ActionTypes.newPage:
      return {
        ...state,
        status: ApiStateStatus.shouldFetch,
        page: action.page
      };
    case ActionTypes.newSearch:
      return {
        ...state,
        status: ApiStateStatus.shouldFetch,
        search: action.search
      };
    case ActionTypes.newQueryParams:
      return {
        ...state,
        status: ApiStateStatus.shouldFetch
      };
    default:
      throw Error();
  }
}

function useClientsApi(apiState, dispatchApiState) {
  React.useEffect(() => {
    if (apiState.status === ApiStateStatus.shouldFetch) {
      const abortController = new AbortController();
      const query = queryString.stringify({
        ...apiState.search,
        page: apiState.page
      });
      easyFetch(`/api/clients?${query}`).then(data => {
        dispatchApiState({
          type: ActionTypes.fetched,
          apiData: data
        });
      });

      return () => abortController.abort();
    }
  }, [apiState]);
}

function useAlwaysValidPage(apiState, dispatchApiState) {
  React.useEffect(() => {
    if (apiState.status === ApiStateStatus.fetching) {
      // wait for data first
      return;
    }

    const lastPage = Math.ceil(
      apiState.apiData.pagination.numClients /
        apiState.apiData.pagination.pageSize
    );

    let newPage;

    if (
      typeof apiState.page !== "number" ||
      isNaN(apiState.page) ||
      isNaN(lastPage)
    ) {
      newPage = 1;
    } else if (apiState.page <= 0) {
      newPage = 1;
    } else if (lastPage === 0) {
      newPage = 1;
    } else if (apiState.page > lastPage) {
      newPage = 1;
    }

    if (newPage && newPage !== apiState.page) {
      dispatchApiState({
        type: ActionTypes.newPage,
        page: newPage
      });
    }
  }, [apiState]);
}

function useFrontendUrlParams(apiState, dispatchApiState) {
  React.useEffect(() => {
    const params = queryString.parse(window.location.search);
    dispatchApiState({
      type: ActionTypes.newQueryParams,
      params
    });
  }, []);

  React.useEffect(() => {
    const queryParams = queryString.stringify({
      page: apiState.page,
      ...apiState.search
    });

    window.history.replaceState(
      window.history.state,
      document.title,
      window.location.pathname + "?" + queryParams
    );
  }, [apiState]);
}

type ApiState = {
  status: ApiStateStatus;
  apiData: ClientApiData;
  page: number;
  search: SearchParseValues;
};

enum ApiStateStatus {
  shouldFetch = "shouldFetch",
  fetching = "fetching",
  fetched = "fetched"
}

enum ActionTypes {
  newPage = "newPage",
  newSearch = "newSearch",
  newQueryParams = "newQueryParams",
  fetching = "fetching",
  fetched = "fetched"
}

type ApiStateAction =
  | NewPageAction
  | NewSearchAction
  | NewParamsAction
  | FetchingAction
  | FetchedAction;

type NewPageAction = {
  type: ActionTypes.newPage;
  page: number;
};

type NewSearchAction = {
  type: ActionTypes.newSearch;
  search: SearchParseValues;
};

type NewParamsAction = {
  type: ActionTypes.newQueryParams;
  params: SearchParseValues & {
    page: number;
  };
};

type FetchingAction = {
  type: ActionTypes.fetching;
};

type FetchedAction = {
  type: ActionTypes.fetched;
  apiData: ClientApiData;
};

type ClientListProps = {
  path: string;
};

type ClientApiData = {
  clients: ClientListClient[];
  pagination: {
    numClients: number;
    currentPage: number;
    pageSize: number;
    numPages: number;
  };
};

export type ClientListClient = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  zip: string;
  birthday: string;
  phone: string;
  email: string;
  dateAdded: string;
  createdBy: {
    userId: number;
    fullName: string;
  };
};

const initialState = {
  status: ApiStateStatus.fetched,
  apiData: {
    pagination: {
      currentPage: 0,
      numPages: 0,
      numClients: 0,
      pageSize: 0
    },
    clients: []
  },
  page: null,
  search: null
};
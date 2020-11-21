const { app, databaseError, pool, invalidRequest } = require("../../../server");
const mysql = require("mysql");
const {
  checkValid,
  validId,
  validDate,
  validTime,
  validArray,
  validDateTime,
  nullableValidDateTime,
} = require("../../utils/validation-utils");
const fs = require("fs");
const path = require("path");
const followUpsSql = fs.readFileSync(
  path.resolve(__dirname, "./create-follow-up.sql"),
  "utf-8"
);
const getFollowUpSql = fs.readFileSync(
  path.resolve(__dirname, "./get-follow-up.sql"),
  "utf-8"
);
const { insertActivityLogQuery } = require("../client-logs/activity-log.utils");

app.post("/api/clients/:clientId/follow-ups", (req, res) => {
  const user = req.session.passport.user;

  const validationErrors = [
    ...checkValid(req.params, validId("clientId")),
    ...checkValid(req.body, validArray("serviceIds", validId)),
    ...checkValid(req.body, validDateTime("dateOfContact")),
    ...checkValid(req.body, validTime("duration")),
    ...checkValid(req.body, nullableValidDateTime("appointmenetDate")),
  ];

  const { clientId } = req.params;

  const {
    serviceIds,
    title,
    description,
    dateOfContact,
    appointmentDate,
    duration,
  } = req.body;

  if (validationErrors.length > 0) {
    return invalidRequest(res, validationErrors);
  }

  const insertFollowUpSql = mysql.format(followUpsSql, [
    clientId,
    title,
    description,
    dateOfContact,
    appointmentDate,
    duration,
    user.id,
    user.id,
  ]);

  const insertFollowUpServicesSql = mysql.format(`
  INSERT INTO followUpServices (serviceId, followUpId) VALUES (?, ?);
  `);

  pool.query(insertFollowUpSql, (err, insertResult) => {
    if (err) {
      return databaseError(req, res, err);
    }

    let query = "";

    serviceIds.forEach((id) => {
      query += mysql.format(
        `INSERT INTO followUpServices (serviceId, followUpId) VALUES (?, ?);`,
        [id, insertResult.insertId]
      );
    });

    query += insertActivityLogQuery({
      detailId: insertResult.insertId,
      clientId,
      title,
      description,
      logType: "follow-up",
      addedBy: user.id,
    });

    pool.query(query, (err, joinResult) => {
      if (err) {
        return databaseError(req, res, err);
      }

      formattedFollowUpResponse(insertResult.insertId, (err, result) => {
        if (err) {
          return databaseError(err);
        }
        res.send(result);
      });
    });
  });
});

function formattedFollowUpResponse(id, errBack) {
  const query = mysql.format(getFollowUpSql, [id, id]);
  pool.query(query, (err, followUpResult) => {
    if (err) {
      return errBack(err, null);
    } else {
      let formattedResult = { ...followUpResult[0] };
      formattedResult.serviceIds = JSON.parse(formattedResult.serviceIds);
      formattedResult.createdBy = JSON.parse(formattedResult.createdBy);
      formattedResult.lastUpdatedBy = JSON.parse(formattedResult.lastUpdatedBy);
      errBack(null, formattedResult);
    }
  });
}

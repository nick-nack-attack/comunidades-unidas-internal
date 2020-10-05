CREATE TABLE partners (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  isActive BOOLEAN NOT NULL,
  name VARCHAR(128) NOT NULL,
  dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
  dateModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  addedBy int NOT NULL,
  modifiedBy int NOT NULL,
  FOREIGN KEY (addedBy) REFERENCES users(id),
  FOREIGN KEY (modifiedBy) REFERENCES users(id)
);

CREATE TABLE partnerServices (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  partnerId INT NOT NULL,
  name VARCHAR(128) NOT NULL,
  isActive BOOLEAN NOT NULL,
  dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
  dateModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  addedBy int NOT NULL,
  modifiedBy int NOT NULL,
  FOREIGN KEY (addedBy) REFERENCES users(id),
  FOREIGN KEY (modifiedBy) REFERENCES users(id),
  FOREIGN KEY (partnerId) REFERENCES partners(id)
);

CREATE TABLE leadReferrals (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  leadId INT NOT NULL,
  partnerServiceId INT NOT NULL,
  addedBy INT NOT NULL,
  dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
  isDeleted BOOLEAN DEFAULT FALSE NOT NULL,
  FOREIGN KEY (addedBy) REFERENCES users(id),
  FOREIGN KEY (leadId) REFERENCES leads(id),
  FOREIGN KEY (partnerServiceId) REFERENCES partnerServices(id)
);

CREATE TABLE clientReferrals (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  clientId INT NOT NULL,
  partnerServiceId INT NOT NULL,
  isDeleted BOOLEAN DEFAULT FALSE NOT NULL,
  addedBy INT NOT NULL,
  dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (addedBy) REFERENCES users(id),
  FOREIGN KEY (clientId) REFERENCES clients(id),
  FOREIGN KEY (partnerServiceId) REFERENCES partnerServices(id)
);
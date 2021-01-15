CREATE TABLE materials (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(256)
);

CREATE TABLE eventMaterials (
  eventId INT NOT NULL,
  materialId INT NOT NULL,
  quantityDistributed INT NOT NULL
);
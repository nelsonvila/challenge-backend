CREATE DATABASE ChallengeDB;
GO
USE ChallengeDB;
GO
CREATE TABLE dbo.Clientes (
  Id varchar(6)     NOT NULL PRIMARY KEY,
  Nombre nvarchar(100) NOT NULL,
  Apellido nvarchar(100) NOT NULL,
  Email nvarchar(200) NULL,
  Edad int           NULL
);
GO

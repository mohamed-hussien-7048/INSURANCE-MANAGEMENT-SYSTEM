IF OBJECT_ID(N'dbo.Customers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Customers
    (
        CustomerId BIGINT IDENTITY(1, 1) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(254) NULL,
        PhoneNumber NVARCHAR(20) NULL,
        DateOfBirth DATE NULL,
        IsActive BIT NOT NULL
            CONSTRAINT DF_Customers_IsActive DEFAULT (1),
        CreatedAt DATETIME2(3) NOT NULL
            CONSTRAINT DF_Customers_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME2(3) NULL,
        Version ROWVERSION NOT NULL,

        CONSTRAINT PK_Customers
            PRIMARY KEY (CustomerId),

        CONSTRAINT CK_Customers_FirstName_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(FirstName))) > 0),

        CONSTRAINT CK_Customers_LastName_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(LastName))) > 0)
    );
END;
GO

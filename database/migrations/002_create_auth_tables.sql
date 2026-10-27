IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        UserId BIGINT IDENTITY(1, 1) NOT NULL,
        Email NVARCHAR(254) NOT NULL,
        NormalizedEmail NVARCHAR(254) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        DisplayName NVARCHAR(100) NOT NULL,

        Role VARCHAR(20) NOT NULL
            CONSTRAINT DF_Users_Role DEFAULT ('Employee'),

        Status VARCHAR(20) NOT NULL
            CONSTRAINT DF_Users_Status DEFAULT ('Pending'),

        FailedLoginAttempts INT NOT NULL
            CONSTRAINT DF_Users_FailedLoginAttempts DEFAULT (0),

        LockedUntil DATETIME2(3) NULL,
        LastLoginAt DATETIME2(3) NULL,

        CreatedAt DATETIME2(3) NOT NULL
            CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),

        UpdatedAt DATETIME2(3) NULL,

        CONSTRAINT PK_Users PRIMARY KEY (UserId),

        CONSTRAINT UQ_Users_NormalizedEmail
            UNIQUE (NormalizedEmail),

        CONSTRAINT CK_Users_Role
            CHECK (Role IN ('Admin', 'Employee', 'ReadOnly')),

        CONSTRAINT CK_Users_Status
            CHECK (Status IN ('Pending', 'Active', 'Disabled')),

        CONSTRAINT CK_Users_FailedLoginAttempts
            CHECK (FailedLoginAttempts >= 0),

        CONSTRAINT CK_Users_Email_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(Email))) > 0),

        CONSTRAINT CK_Users_NormalizedEmail_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(NormalizedEmail))) > 0),

        CONSTRAINT CK_Users_DisplayName_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(DisplayName))) > 0),

        CONSTRAINT CK_Users_PasswordHash_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(PasswordHash))) > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.AuthSessions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuthSessions
    (
        SessionId BIGINT IDENTITY(1, 1) NOT NULL,
        UserId BIGINT NOT NULL,
        TokenHash CHAR(64) NOT NULL,

        CreatedAt DATETIME2(3) NOT NULL
            CONSTRAINT DF_AuthSessions_CreatedAt DEFAULT (SYSUTCDATETIME()),

        ExpiresAt DATETIME2(3) NOT NULL,
        RevokedAt DATETIME2(3) NULL,
        LastSeenAt DATETIME2(3) NULL,

        CONSTRAINT PK_AuthSessions PRIMARY KEY (SessionId),

        CONSTRAINT FK_AuthSessions_Users
            FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),

        CONSTRAINT UQ_AuthSessions_TokenHash UNIQUE (TokenHash),

        CONSTRAINT CK_AuthSessions_Expiry
            CHECK (ExpiresAt > CreatedAt)
    );

    CREATE INDEX IX_AuthSessions_UserId_ExpiresAt
        ON dbo.AuthSessions (UserId, ExpiresAt);

    CREATE INDEX IX_AuthSessions_ExpiresAt
        ON dbo.AuthSessions (ExpiresAt);
END;
GO

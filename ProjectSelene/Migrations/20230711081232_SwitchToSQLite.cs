#nullable disable

namespace ProjectSelene.Migrations;

/// <inheritdoc />
public partial class SwitchToSQLite : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<bool>(
            name: "IsAdmin",
            table: "Users",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(bool),
            oldType: "tinyint(1)");

        migrationBuilder.AlterColumn<int>(
            name: "GithubId",
            table: "Users",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "Users",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);

        migrationBuilder.AlterColumn<string>(
            name: "Version",
            table: "ModVersion",
            type: "TEXT",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "longtext");

        migrationBuilder.AlterColumn<int>(
            name: "VerifiedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "int",
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "SubmittedOn",
            table: "ModVersion",
            type: "TEXT",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "datetime(6)");

        migrationBuilder.AlterColumn<int>(
            name: "SubmittedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.AlterColumn<int>(
            name: "OwnedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "ModVersion",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);

        migrationBuilder.AlterColumn<int>(
            name: "ModInfoId",
            table: "Mods",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.AlterColumn<string>(
            name: "LatestVersionNumber",
            table: "Mods",
            type: "TEXT",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "longtext",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "Info_Name",
            table: "Mods",
            type: "TEXT",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "longtext");

        migrationBuilder.AlterColumn<string>(
            name: "Info_Description",
            table: "Mods",
            type: "TEXT",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "longtext");

        migrationBuilder.AlterColumn<int>(
            name: "AuthorId",
            table: "Mods",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "Mods",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);

        migrationBuilder.AlterColumn<string>(
            name: "Url",
            table: "Artifact",
            type: "TEXT",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "longtext");

        migrationBuilder.AlterColumn<int>(
            name: "ModVersionId",
            table: "Artifact",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "Artifact",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<bool>(
            name: "IsAdmin",
            table: "Users",
            type: "tinyint(1)",
            nullable: false,
            oldClrType: typeof(bool),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<int>(
            name: "GithubId",
            table: "Users",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "Users",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);

        migrationBuilder.AlterColumn<string>(
            name: "Version",
            table: "ModVersion",
            type: "longtext",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "TEXT");

        migrationBuilder.AlterColumn<int>(
            name: "VerifiedById",
            table: "ModVersion",
            type: "int",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "INTEGER",
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "SubmittedOn",
            table: "ModVersion",
            type: "datetime(6)",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "TEXT");

        migrationBuilder.AlterColumn<int>(
            name: "SubmittedById",
            table: "ModVersion",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<int>(
            name: "OwnedById",
            table: "ModVersion",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "ModVersion",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);

        migrationBuilder.AlterColumn<int>(
            name: "ModInfoId",
            table: "Mods",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<string>(
            name: "LatestVersionNumber",
            table: "Mods",
            type: "longtext",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "TEXT",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "Info_Name",
            table: "Mods",
            type: "longtext",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "TEXT");

        migrationBuilder.AlterColumn<string>(
            name: "Info_Description",
            table: "Mods",
            type: "longtext",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "TEXT");

        migrationBuilder.AlterColumn<int>(
            name: "AuthorId",
            table: "Mods",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "Mods",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);

        migrationBuilder.AlterColumn<string>(
            name: "Url",
            table: "Artifact",
            type: "longtext",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "TEXT");

        migrationBuilder.AlterColumn<int>(
            name: "ModVersionId",
            table: "Artifact",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "Artifact",
            type: "int",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER")
            .Annotation("Sqlite:Autoincrement", true)
            .OldAnnotation("Sqlite:Autoincrement", true);
    }
}

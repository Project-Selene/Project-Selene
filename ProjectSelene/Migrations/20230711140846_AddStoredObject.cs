#nullable disable

namespace ProjectSelene.Migrations;

/// <inheritdoc />
public partial class AddStoredObject : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion");

        migrationBuilder.DropColumn(
            name: "Info_Description",
            table: "Mods");

        migrationBuilder.DropColumn(
            name: "Info_Name",
            table: "Mods");

        migrationBuilder.AlterColumn<int>(
            name: "OwnedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AddColumn<int>(
            name: "ModId",
            table: "ModVersion",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "StoredObjectId",
            table: "Artifact",
            type: "TEXT",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "ModInfo",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                Name = table.Column<string>(type: "TEXT", nullable: false),
                Description = table.Column<string>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ModInfo", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "StoredObjects",
            columns: table => new
            {
                Id = table.Column<string>(type: "TEXT", nullable: false),
                OwnerId = table.Column<int>(type: "INTEGER", nullable: false),
                UploadedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_StoredObjects", x => x.Id);
                table.ForeignKey(
                    name: "FK_StoredObjects_Users_OwnerId",
                    column: x => x.OwnerId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_ModVersion_ModId",
            table: "ModVersion",
            column: "ModId");

        migrationBuilder.CreateIndex(
            name: "IX_Mods_ModInfoId",
            table: "Mods",
            column: "ModInfoId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Artifact_StoredObjectId",
            table: "Artifact",
            column: "StoredObjectId");

        migrationBuilder.CreateIndex(
            name: "IX_StoredObjects_OwnerId",
            table: "StoredObjects",
            column: "OwnerId");

        migrationBuilder.AddForeignKey(
            name: "FK_Artifact_StoredObjects_StoredObjectId",
            table: "Artifact",
            column: "StoredObjectId",
            principalTable: "StoredObjects",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_Mods_ModInfo_ModInfoId",
            table: "Mods",
            column: "ModInfoId",
            principalTable: "ModInfo",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersion_Mods_ModId",
            table: "ModVersion",
            column: "ModId",
            principalTable: "Mods",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion",
            column: "OwnedById",
            principalTable: "Mods",
            principalColumn: "Id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Artifact_StoredObjects_StoredObjectId",
            table: "Artifact");

        migrationBuilder.DropForeignKey(
            name: "FK_Mods_ModInfo_ModInfoId",
            table: "Mods");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Mods_ModId",
            table: "ModVersion");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion");

        migrationBuilder.DropTable(
            name: "ModInfo");

        migrationBuilder.DropTable(
            name: "StoredObjects");

        migrationBuilder.DropIndex(
            name: "IX_ModVersion_ModId",
            table: "ModVersion");

        migrationBuilder.DropIndex(
            name: "IX_Mods_ModInfoId",
            table: "Mods");

        migrationBuilder.DropIndex(
            name: "IX_Artifact_StoredObjectId",
            table: "Artifact");

        migrationBuilder.DropColumn(
            name: "ModId",
            table: "ModVersion");

        migrationBuilder.DropColumn(
            name: "StoredObjectId",
            table: "Artifact");

        migrationBuilder.AlterColumn<int>(
            name: "OwnedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "INTEGER",
            oldNullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Info_Description",
            table: "Mods",
            type: "TEXT",
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "Info_Name",
            table: "Mods",
            type: "TEXT",
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion",
            column: "OwnedById",
            principalTable: "Mods",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }
}

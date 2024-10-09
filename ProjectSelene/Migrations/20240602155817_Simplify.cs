using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectSelene.Migrations;

/// <inheritdoc />
public partial class Simplify : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Artifact_StoredObjects_StoredObjectId",
            table: "Artifact");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Artifact_DownloadId",
            table: "ModVersion");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Users_SubmittedById",
            table: "ModVersion");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Users_VerifiedById",
            table: "ModVersion");

        migrationBuilder.DropTable(
            name: "StoredObjects");

        migrationBuilder.DropPrimaryKey(
            name: "PK_ModVersion",
            table: "ModVersion");

        migrationBuilder.DropPrimaryKey(
            name: "PK_Artifact",
            table: "Artifact");

        migrationBuilder.DropIndex(
            name: "IX_Artifact_StoredObjectId",
            table: "Artifact");

        migrationBuilder.DropColumn(
            name: "StoredObjectId",
            table: "Artifact");

        migrationBuilder.RenameTable(
            name: "ModVersion",
            newName: "ModVersions");

        migrationBuilder.RenameTable(
            name: "Artifact",
            newName: "Artifacts");

        migrationBuilder.RenameColumn(
            name: "OwnedById",
            table: "ModVersions",
            newName: "ModId");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersion_VerifiedById",
            table: "ModVersions",
            newName: "IX_ModVersions_VerifiedById");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersion_SubmittedById",
            table: "ModVersions",
            newName: "IX_ModVersions_SubmittedById");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersion_OwnedById",
            table: "ModVersions",
            newName: "IX_ModVersions_ModId");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersion_DownloadId",
            table: "ModVersions",
            newName: "IX_ModVersions_DownloadId");

        migrationBuilder.RenameColumn(
            name: "Url",
            table: "Artifacts",
            newName: "UploadedAt");

        migrationBuilder.AlterColumn<int>(
            name: "VerifiedById",
            table: "ModVersions",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "INTEGER",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "DownloadId",
            table: "ModVersions",
            type: "TEXT",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AddColumn<DateTime>(
            name: "VerifiedOn",
            table: "ModVersions",
            type: "TEXT",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

        migrationBuilder.AlterColumn<string>(
            name: "Id",
            table: "Artifacts",
            type: "TEXT",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "INTEGER")
            .OldAnnotation("Sqlite:Autoincrement", true);

        migrationBuilder.AddColumn<int>(
            name: "OwnerId",
            table: "Artifacts",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddPrimaryKey(
            name: "PK_ModVersions",
            table: "ModVersions",
            column: "Id");

        migrationBuilder.AddPrimaryKey(
            name: "PK_Artifacts",
            table: "Artifacts",
            column: "Id");

        migrationBuilder.CreateTable(
            name: "ModVersionDrafts",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                Version = table.Column<string>(type: "TEXT", nullable: false),
                CreatedById = table.Column<int>(type: "INTEGER", nullable: false),
                CreatedOn = table.Column<DateTime>(type: "TEXT", nullable: false),
                DownloadId = table.Column<string>(type: "TEXT", nullable: false),
                SubmittedOn = table.Column<DateTime>(type: "TEXT", nullable: true),
                ModId = table.Column<int>(type: "INTEGER", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ModVersionDrafts", x => x.Id);
                table.ForeignKey(
                    name: "FK_ModVersionDrafts_Artifacts_DownloadId",
                    column: x => x.DownloadId,
                    principalTable: "Artifacts",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_ModVersionDrafts_Mods_ModId",
                    column: x => x.ModId,
                    principalTable: "Mods",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_ModVersionDrafts_Users_CreatedById",
                    column: x => x.CreatedById,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Artifacts_OwnerId",
            table: "Artifacts",
            column: "OwnerId");

        migrationBuilder.CreateIndex(
            name: "IX_ModVersionDrafts_CreatedById",
            table: "ModVersionDrafts",
            column: "CreatedById");

        migrationBuilder.CreateIndex(
            name: "IX_ModVersionDrafts_DownloadId",
            table: "ModVersionDrafts",
            column: "DownloadId");

        migrationBuilder.CreateIndex(
            name: "IX_ModVersionDrafts_ModId",
            table: "ModVersionDrafts",
            column: "ModId");

        migrationBuilder.AddForeignKey(
            name: "FK_Artifacts_Users_OwnerId",
            table: "Artifacts",
            column: "OwnerId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersions_Artifacts_DownloadId",
            table: "ModVersions",
            column: "DownloadId",
            principalTable: "Artifacts",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersions_Mods_ModId",
            table: "ModVersions",
            column: "ModId",
            principalTable: "Mods",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersions_Users_SubmittedById",
            table: "ModVersions",
            column: "SubmittedById",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersions_Users_VerifiedById",
            table: "ModVersions",
            column: "VerifiedById",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Artifacts_Users_OwnerId",
            table: "Artifacts");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersions_Artifacts_DownloadId",
            table: "ModVersions");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersions_Mods_ModId",
            table: "ModVersions");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersions_Users_SubmittedById",
            table: "ModVersions");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersions_Users_VerifiedById",
            table: "ModVersions");

        migrationBuilder.DropTable(
            name: "ModVersionDrafts");

        migrationBuilder.DropPrimaryKey(
            name: "PK_ModVersions",
            table: "ModVersions");

        migrationBuilder.DropPrimaryKey(
            name: "PK_Artifacts",
            table: "Artifacts");

        migrationBuilder.DropIndex(
            name: "IX_Artifacts_OwnerId",
            table: "Artifacts");

        migrationBuilder.DropColumn(
            name: "VerifiedOn",
            table: "ModVersions");

        migrationBuilder.DropColumn(
            name: "OwnerId",
            table: "Artifacts");

        migrationBuilder.RenameTable(
            name: "ModVersions",
            newName: "ModVersion");

        migrationBuilder.RenameTable(
            name: "Artifacts",
            newName: "Artifact");

        migrationBuilder.RenameColumn(
            name: "ModId",
            table: "ModVersion",
            newName: "OwnedById");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersions_VerifiedById",
            table: "ModVersion",
            newName: "IX_ModVersion_VerifiedById");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersions_SubmittedById",
            table: "ModVersion",
            newName: "IX_ModVersion_SubmittedById");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersions_ModId",
            table: "ModVersion",
            newName: "IX_ModVersion_OwnedById");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersions_DownloadId",
            table: "ModVersion",
            newName: "IX_ModVersion_DownloadId");

        migrationBuilder.RenameColumn(
            name: "UploadedAt",
            table: "Artifact",
            newName: "Url");

        migrationBuilder.AlterColumn<int>(
            name: "VerifiedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "INTEGER");

        migrationBuilder.AlterColumn<int>(
            name: "DownloadId",
            table: "ModVersion",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "TEXT");

        migrationBuilder.AlterColumn<int>(
            name: "Id",
            table: "Artifact",
            type: "INTEGER",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "TEXT")
            .Annotation("Sqlite:Autoincrement", true);

        migrationBuilder.AddColumn<string>(
            name: "StoredObjectId",
            table: "Artifact",
            type: "TEXT",
            nullable: true);

        migrationBuilder.AddPrimaryKey(
            name: "PK_ModVersion",
            table: "ModVersion",
            column: "Id");

        migrationBuilder.AddPrimaryKey(
            name: "PK_Artifact",
            table: "Artifact",
            column: "Id");

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
            name: "FK_ModVersion_Artifact_DownloadId",
            table: "ModVersion",
            column: "DownloadId",
            principalTable: "Artifact",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion",
            column: "OwnedById",
            principalTable: "Mods",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersion_Users_SubmittedById",
            table: "ModVersion",
            column: "SubmittedById",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_ModVersion_Users_VerifiedById",
            table: "ModVersion",
            column: "VerifiedById",
            principalTable: "Users",
            principalColumn: "Id");
    }
}

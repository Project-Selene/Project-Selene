using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectSelene.Migrations;

/// <inheritdoc />
public partial class ExplicitDownloadArtifact : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Mods_ModId",
            table: "ModVersion");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion");

        migrationBuilder.RenameColumn(
            name: "ModId",
            table: "ModVersion",
            newName: "DownloadId");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersion_ModId",
            table: "ModVersion",
            newName: "IX_ModVersion_DownloadId");

        migrationBuilder.AlterColumn<int>(
            name: "OwnedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "INTEGER",
            oldNullable: true);

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
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Artifact_DownloadId",
            table: "ModVersion");

        migrationBuilder.DropForeignKey(
            name: "FK_ModVersion_Mods_OwnedById",
            table: "ModVersion");

        migrationBuilder.RenameColumn(
            name: "DownloadId",
            table: "ModVersion",
            newName: "ModId");

        migrationBuilder.RenameIndex(
            name: "IX_ModVersion_DownloadId",
            table: "ModVersion",
            newName: "IX_ModVersion_ModId");

        migrationBuilder.AlterColumn<int>(
            name: "OwnedById",
            table: "ModVersion",
            type: "INTEGER",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "INTEGER");

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
}

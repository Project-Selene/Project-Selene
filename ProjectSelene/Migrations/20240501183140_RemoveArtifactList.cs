using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectSelene.Migrations
{
    /// <inheritdoc />
    public partial class RemoveArtifactList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Artifact_ModVersion_ModVersionId",
                table: "Artifact");

            migrationBuilder.DropIndex(
                name: "IX_Artifact_ModVersionId",
                table: "Artifact");

            migrationBuilder.DropColumn(
                name: "ModVersionId",
                table: "Artifact");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ModVersionId",
                table: "Artifact",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Artifact_ModVersionId",
                table: "Artifact",
                column: "ModVersionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Artifact_ModVersion_ModVersionId",
                table: "Artifact",
                column: "ModVersionId",
                principalTable: "ModVersion",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

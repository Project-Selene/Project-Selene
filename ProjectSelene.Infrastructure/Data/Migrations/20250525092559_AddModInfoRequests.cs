using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectSelene.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddModInfoRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ModInfoChangeRequest",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ModInfoId = table.Column<int>(type: "INTEGER", nullable: false),
                    ConnectedModVersionId = table.Column<int>(type: "INTEGER", nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    CreatedById = table.Column<string>(type: "TEXT", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    LastModifiedById = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModInfoChangeRequest", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModInfoChangeRequest_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ModInfoChangeRequest_AspNetUsers_LastModifiedById",
                        column: x => x.LastModifiedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ModInfoChangeRequest_ModInfo_ModInfoId",
                        column: x => x.ModInfoId,
                        principalTable: "ModInfo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModInfoChangeRequest_ModVersions_ConnectedModVersionId",
                        column: x => x.ConnectedModVersionId,
                        principalTable: "ModVersions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModInfoChangeRequest_ConnectedModVersionId",
                table: "ModInfoChangeRequest",
                column: "ConnectedModVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_ModInfoChangeRequest_CreatedById",
                table: "ModInfoChangeRequest",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ModInfoChangeRequest_LastModifiedById",
                table: "ModInfoChangeRequest",
                column: "LastModifiedById");

            migrationBuilder.CreateIndex(
                name: "IX_ModInfoChangeRequest_ModInfoId",
                table: "ModInfoChangeRequest",
                column: "ModInfoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ModInfoChangeRequest");
        }
    }
}

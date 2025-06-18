#nullable disable

namespace ProjectSelene.Migrations;

public partial class LastVersionNumber : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "LatestVersionNumber",
            table: "Mods",
            type: "longtext",
            nullable: true)
            .Annotation("MySql:CharSet", "utf8mb4");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "LatestVersionNumber",
            table: "Mods");
    }
}

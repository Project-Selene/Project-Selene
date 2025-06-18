#nullable disable

namespace ProjectSelene.Migrations;

/// <inheritdoc />
public partial class ModIdGuid : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "Guid",
            table: "Mods",
            type: "TEXT",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

        migrationBuilder.AddUniqueConstraint(
            name: "AK_Mods_Guid",
            table: "Mods",
            column: "Guid");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropUniqueConstraint(
            name: "AK_Mods_Guid",
            table: "Mods");

        migrationBuilder.DropColumn(
            name: "Guid",
            table: "Mods");
    }
}

using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WebApplication2.Migrations
{
    public partial class AddPolygonEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if the X and Y columns exist and drop them if they do
            migrationBuilder.Sql("ALTER TABLE \"Points\" DROP COLUMN IF EXISTS \"X\";");
            migrationBuilder.Sql("ALTER TABLE \"Points\" DROP COLUMN IF EXISTS \"Y\";");

            // Add X and Y columns only if they do not exist
            migrationBuilder.AddColumn<double>(
                name: "X",
                table: "Points",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Y",
                table: "Points",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateTable(
                name: "Polygons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Wkt = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Polygons", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Polygons");

            migrationBuilder.DropColumn(
                name: "X",
                table: "Points");

            migrationBuilder.DropColumn(
                name: "Y",
                table: "Points");

            migrationBuilder.AddColumn<string>(
                name: "Wkt",
                table: "Points",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}

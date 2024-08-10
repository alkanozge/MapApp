using Microsoft.EntityFrameworkCore;

namespace WebApplication2
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }


        public DbSet<GeometryEntity> GeometryEntities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
           
            base.OnModelCreating(modelBuilder);
            

            modelBuilder.Entity<GeometryEntity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Wkt).IsRequired();
                entity.Property(e => e.Name).IsRequired();
            });

        }
    }

}

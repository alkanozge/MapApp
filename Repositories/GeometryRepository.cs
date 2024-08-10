using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace WebApplication2.Repositories
{
    public class GeometryRepository : IGeometryRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<GeometryEntity> _geometryDbSet;


        public GeometryRepository(ApplicationDbContext context)
        {
            _context = context;
            _geometryDbSet = context.Set<GeometryEntity>();

        }

      
        public IEnumerable<GeometryEntity> GetAll() => _geometryDbSet.ToList();
        public GeometryEntity GetById(int id) => _geometryDbSet.Find(id);
        public void Insert(GeometryEntity entity)
        {
            _geometryDbSet.Add(entity);
            _context.SaveChanges(); 
        }
        public void Update(int id, GeometryEntity updatedEntity)
        {
            var entity = _geometryDbSet.Find(id);
            if (entity != null)
            {
                _context.Entry(entity).CurrentValues.SetValues(updatedEntity);
                _context.SaveChanges(); 
            }
        }
        public void Delete(int id)
        {
            var entity = _geometryDbSet.Find(id);
            if (entity != null)
            {
                _geometryDbSet.Remove(entity);
                _context.SaveChanges(); 
            }
        }
    }
}

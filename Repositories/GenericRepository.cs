using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace WebApplication2.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public IEnumerable<T> GetAll()
        {
            return _dbSet.ToList();
        }

        

        public T GetById(int id)
        {
            return _dbSet.Find(id);
        }

        public void Insert(T entity)
        {
            _dbSet.Add(entity);
        }


       
        
        public void Update(int id, T updatedEntity)
        {
            var entity = _dbSet.Find(id);
            if (entity != null)
            {
                _context.Entry(entity).CurrentValues.SetValues(updatedEntity);
            }
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace WebApplication2.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        IEnumerable<T> GetAll();
        T GetById(int id);
        void Insert(T entity);
        void Update(int id, T updatedEntity);
        void Delete(T entity);
    }
}
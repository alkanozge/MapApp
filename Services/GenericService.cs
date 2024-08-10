using System;
using System.Collections.Generic;
using WebApplication2.Repositories;

namespace WebApplication2.Services
{
    public class GenericService<T> : IGenericService<T> where T : class
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<T> _repository;

        public GenericService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _repository = _unitOfWork.Repository<T>();
        }

        public Response<List<T>> GetAll()
        {
            try
            {
                var entities = _repository.GetAll();
                return new Response<List<T>>(entities.ToList(), "Success", true);
            }
            catch (Exception ex)
            {
                return new Response<List<T>>(null, ex.Message, false);
            }
        }

        public Response<T> GetById(int id)
        {
            try
            {
                var entity = _repository.GetById(id);
                if (entity != null)
                {
                    return new Response<T>(entity, "Success", true);
                }
                else
                {
                    return new Response<T>(null, $"No item found with id {id}", false);
                }
            }
            catch (Exception ex)
            {
                return new Response<T>(null, ex.Message, false);
            }
        }

        public Response<T> Add(T entity)
        {
            try
            {
                _repository.Insert(entity);
                _unitOfWork.Complete(); 
                return new Response<T>(entity, "Successfully added", true);
            }
            catch (Exception ex)
            {
                return new Response<T>(null, ex.Message, false);
            }
        }


        public Response<string> Update(int id, T updatedEntity)
        {
            try
            {
                var entity = _repository.GetById(id);
                if (entity != null)
                {
                    _repository.Update(id, updatedEntity); 
                    _unitOfWork.Complete(); 
                    return new Response<string>("Successfully updated", "Success", true);
                }
                else
                {
                    return new Response<string>(null, $"No item found with id {id}", false);
                }
            }
            catch (Exception ex)
            {
                return new Response<string>(null, ex.Message, false);
            }
        }

        public Response<string> Delete(int id)
        {
            try
            {
                var entity = _repository.GetById(id);
                if (entity != null)
                {
                    _repository.Delete(entity);
                    _unitOfWork.Complete(); 
                    return new Response<string>($"Successfully deleted item with id {id}", "Success", true);
                }
                else
                {
                    return new Response<string>(null, $"No item found with id {id}", false);
                }
            }
            catch (Exception ex)
            {
                return new Response<string>(null, ex.Message, false);
            }
        }
    }
}

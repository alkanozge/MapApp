using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using WebApplication2.Repositories;
using WebApplication2.Services;
namespace WebApplication2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeometryController : ControllerBase
    {
        private readonly IGeometryRepository _geometryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public GeometryController(IGeometryRepository geometryRepository, IUnitOfWork unitOfWork)
        {
            _geometryRepository = geometryRepository;
            _unitOfWork = unitOfWork;
        }

        
        [HttpGet]
        public ActionResult<Response<List<GeometryEntity>>> GetAll()
        {
            var geometries = _geometryRepository.GetAll();
            return new Response<List<GeometryEntity>>(geometries.ToList(), "Fetched successfully", true);
        }

        [HttpGet("{id}")]
        public ActionResult<Response<GeometryEntity>> GetById(int id)
        {
            var geometry = _geometryRepository.GetById(id);
            return geometry != null
                ? new Response<GeometryEntity>(geometry, "Fetched successfully", true)
                : new Response<GeometryEntity>(null, "Not found", false);
        }

        [HttpPost]
        public ActionResult<Response<GeometryEntity>> Add([FromBody] GeometryEntity geometry)
        {
            _geometryRepository.Insert(geometry);
            _unitOfWork.Complete();
            return new Response<GeometryEntity>(geometry, "Added successfully", true);
        }

        [HttpPut("{id}")]
        public ActionResult<Response<string>> Update(int id, [FromBody] GeometryEntity updatedGeometry)
        {
            _geometryRepository.Update(id, updatedGeometry);
            _unitOfWork.Complete();
            return new Response<string>("Updated successfully", "Success", true);
        }

        [HttpDelete("{id}")]
        public ActionResult<Response<string>> Delete(int id)
        {
            _geometryRepository.Delete(id);
            _unitOfWork.Complete();
            return new Response<string>("Deleted successfully", "Success", true);
        }
    }


}

using System.Collections.Generic;
using System.Threading.Tasks;
using Eolvis.App.Models;

namespace Eolvis.App.Services.Interfaces
{
    public interface IProjectService
    {
        Task<List<Project>> GetAllProjects();
        
        Task<Project?> GetProjectByKey(string key);
    }
}
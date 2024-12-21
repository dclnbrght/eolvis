using System.Collections.Generic;
using System.Threading.Tasks;
using Eolvis.App.Models;

namespace Eolvis.App.Services.Interfaces
{
    public interface IUserProfileService
    {        
        Task<UserProfile?> GetUserProfile(string userName);
    }
}
// pages/admin/AdminAgents.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiEye, FiCheck, FiX, FiTrash2, FiPhone, FiMail, FiBriefcase, FiShield, FiStar, FiPlus } from 'react-icons/fi';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadAgents = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching agents...');
      const response = await api.get('/real-estate/agents');
      console.log('📊 Agents response:', response.data);
      
      // Check if data exists
      const agentsData = response.data?.data || [];
      setAgents(agentsData);
      
      if (agentsData.length === 0) {
        console.log('ℹ️ No agents found in database');
      }
    } catch (error) {
      console.error('❌ Error loading agents:', error);
      toast.error('Failed to load agents: ' + (error.response?.data?.message || error.message));
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const updateAgent = async (id, data) => {
    try {
      await api.put(`/real-estate/agents/${id}`, data);
      toast.success('Agent updated successfully');
      loadAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const handleVerifyAgent = async (agentId, verified) => {
    try {
      await api.put(`/real-estate/agents/${agentId}`, { is_verified: verified });
      toast.success(`Agent ${verified ? 'verified' : 'unverified'} successfully`);
      loadAgents();
    } catch (error) {
      console.error('Error verifying agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    try {
      await api.delete(`/real-estate/agents/${agentId}`);
      toast.success('Agent deleted successfully');
      loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            👤 Agents Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage all registered real estate agents ({agents.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAgents}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {agents.filter(a => a.is_verified).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {agents.filter(a => !a.is_verified).length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {agents.reduce((sum, a) => sum + (a.total_reviews || 0), 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
        </div>
      </div>

      {/* Agents Table */}
      {agents.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Agent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
                          {agent.name?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {agent.years_experience || 0} years exp.
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <FiMail className="text-xs text-gray-400" />
                          {agent.email || agent.user?.email || '-'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <FiPhone className="text-xs text-gray-400" />
                          {agent.phone || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {agent.company || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${
                        agent.is_verified
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {agent.is_verified ? (
                          <><FiCheck className="text-xs" /> Verified</>
                        ) : (
                          <><FiX className="text-xs" /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {agent.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <FiStar className="text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.rating}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({agent.total_reviews || 0})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No reviews</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowDetails(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                          title="View Details"
                        >
                          <FiEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleVerifyAgent(agent.id, !agent.is_verified)}
                          className={`p-1.5 transition-colors ${
                            agent.is_verified
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-green-500 hover:text-green-600'
                          }`}
                          title={agent.is_verified ? 'Unverify' : 'Verify'}
                        >
                          {agent.is_verified ? <FiX /> : <FiCheck />}
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-12 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Agents Registered Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Agents need to register through the agent registration page.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/agent/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <FiPlus />
              Go to Agent Registration
            </a>
            <button
              onClick={loadAgents}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Agent Details Modal */}
      {showDetails && selectedAgent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Agent Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                  {selectedAgent.name?.[0] || 'A'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedAgent.email || selectedAgent.user?.email}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedAgent.is_verified
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {selectedAgent.is_verified ? '✅ Verified' : '⏳ Pending'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAgent.phone || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAgent.company || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">License Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAgent.license_number || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Years Experience</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAgent.years_experience || 0}</p>
                </div>
              </div>

              {selectedAgent.bio && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
                  <p className="text-gray-900 dark:text-white">{selectedAgent.bio}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    handleVerifyAgent(selectedAgent.id, !selectedAgent.is_verified);
                    setShowDetails(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    selectedAgent.is_verified
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {selectedAgent.is_verified ? 'Unverify Agent' : 'Verify Agent'}
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgents;
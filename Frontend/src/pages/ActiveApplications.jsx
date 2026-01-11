// Frontend/src/pages/ActiveApplications.jsx
import React, { useState, useEffect } from "react";
import { applicationAPI } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  X,
  Trash2,
  Eye,
  Edit,
  MoreVertical,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const ActiveApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    applicationId: null,
    applicationNumber: "",
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState({
    isOpen: false,
    selectedCount: 0,
  });
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  useEffect(() => {
    // Update selectAll based on current filtered applications
    if (filteredApplications.length > 0) {
      const allSelected = filteredApplications.every(app => 
        selectedApps.includes(app._id)
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [filteredApplications, selectedApps]);

  const fetchActiveApplications = async () => {
    try {
      const response = await applicationAPI.getUserApplications();
      if (response.data.success) {
        const allApplications = response.data.applications || [];
        
        // Filter out verified, approved, and rejected applications
        const activeApps = allApplications.filter(
          (app) =>
            app.status !== "pending" &&
            app.status !== "approved" &&
            app.status !== "rejected"
        );
        
        setApplications(activeApps);
        setFilteredApplications(activeApps);
        setSelectedApps([]); // Reset selections when applications are fetched
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((app) =>
        app._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
    
    // Filter selected apps to only include those in current filtered list
    const validSelectedApps = selectedApps.filter(appId => 
      filtered.some(app => app._id === appId)
    );
    if (validSelectedApps.length !== selectedApps.length) {
      setSelectedApps(validSelectedApps);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all filtered applications
      const remainingSelected = selectedApps.filter(appId => 
        !filteredApplications.some(app => app._id === appId)
      );
      setSelectedApps(remainingSelected);
    } else {
      // Select all filtered applications
      const newSelectedApps = [
        ...new Set([...selectedApps, ...filteredApplications.map(app => app._id)])
      ];
      setSelectedApps(newSelectedApps);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectApp = (appId) => {
    setSelectedApps(prev => {
      if (prev.includes(appId)) {
        return prev.filter(id => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
  };

  const handleDeleteApplication = async () => {
    if (!deleteModal.applicationId) return;

    setDeleting(true);
    try {
      const response = await applicationAPI.deleteApplication(deleteModal.applicationId);
      if (response.data.success) {
        // Remove application from state
        setApplications(prev => prev.filter(app => app._id !== deleteModal.applicationId));
        // Remove from selected apps
        setSelectedApps(prev => prev.filter(id => id !== deleteModal.applicationId));
        
        // Show success message
        alert("Application deleted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to delete application");
      }
    } catch (error) {
      console.error("Failed to delete application:", error);
      alert(`Failed to delete application: ${error.message}`);
    } finally {
      setDeleting(false);
      setDeleteModal({ isOpen: false, applicationId: null, applicationNumber: "" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApps.length === 0) return;

    setBulkDeleting(true);
    try {
      const deletePromises = selectedApps.map(appId => 
        applicationAPI.deleteApplication(appId).catch(error => {
          console.error(`Failed to delete application ${appId}:`, error);
          return { success: false, appId, error };
        })
      );

      const results = await Promise.all(deletePromises);
      
      const successfulDeletes = results.filter(result => result.success);
      const failedDeletes = results.filter(result => !result.success);

      // Update applications state
      setApplications(prev => prev.filter(app => !selectedApps.includes(app._id)));
      
      // Clear selected apps
      setSelectedApps([]);

      // Show results
      if (successfulDeletes.length > 0 && failedDeletes.length === 0) {
        alert(`Successfully deleted ${successfulDeletes.length} application(s)!`);
      } else if (successfulDeletes.length > 0 && failedDeletes.length > 0) {
        alert(`Deleted ${successfulDeletes.length} application(s). Failed to delete ${failedDeletes.length} application(s).`);
      } else {
        alert("Failed to delete selected applications.");
      }
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("An error occurred during bulk deletion.");
    } finally {
      setBulkDeleting(false);
      setBulkDeleteModal({ isOpen: false, selectedCount: 0 });
    }
  };

  const openDeleteModal = (appId, appNumber) => {
    setDeleteModal({
      isOpen: true,
      applicationId: appId,
      applicationNumber: appNumber,
    });
    setActionMenu(null);
  };

  const openBulkDeleteModal = () => {
    if (selectedApps.length === 0) {
      alert("Please select at least one application to delete.");
      return;
    }
    setBulkDeleteModal({
      isOpen: true,
      selectedCount: selectedApps.length,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, applicationId: null, applicationNumber: "" });
  };

  const closeBulkDeleteModal = () => {
    setBulkDeleteModal({ isOpen: false, selectedCount: 0 });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Document Submitted":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "identity-info-completed":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "personal-info-completed":
        return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "started":
        return "bg-gray-500/10 text-gray-600 border-gray-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Document Submitted":
        return <Clock className="w-4 h-4" />;
      case "identity-info-completed":
        return <CheckCircle className="w-4 h-4" />;
      case "personal-info-completed":
        return <CheckCircle className="w-4 h-4" />;
      case "started":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      started: "Started",
      "personal-info-completed": "Personal Info Completed",
      "identity-info-completed": "Identity Info Completed",
      "Document Submitted": "Document Submitted",
    };
    return statusMap[status] || status;
  };

  const getProgress = (status) => {
    switch (status) {
      case "started":
        return 25;
      case "personal-info-completed":
        return 50;
      case "identity-info-completed":
        return 75;
      case "Document Submitted":
        return 90;
      default:
        return 0;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextStep = (status) => {
    switch (status) {
      case "started":
        return "Complete Personal Information";
      case "personal-info-completed":
        return "Upload Identity Documents";
      case "identity-info-completed":
        return "Submit Documents";
      case "Document Submitted":
        return "Under Review";
      default:
        return "Start Application";
    }
  };

  const handleContinue = (app) => {
    if (app.status === "Document Submitted") {
      return; // No action for submitted applications
    }

    navigate(
      `/accounts/open/${app._id}/${
        app.status === "started"
          ? "personal-info"
          : app.status === "personal-info-completed"
          ? "identity-info"
          : "personal-info"
      }`
    );
  };

  const toggleActionMenu = (appId) => {
    setActionMenu(actionMenu === appId ? null : appId);
  };

  const canDeleteApplication = (status) => {
    // Only applications that are not "Document Submitted" can be deleted
    return status !== "Document Submitted";
  };

  const selectedCount = selectedApps.length;
  const totalCount = filteredApplications.length;
  const canDeleteSelected = selectedApps.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Single Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Application
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete application{" "}
                <span className="font-semibold">
                  #{deleteModal.applicationNumber}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApplication}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Application"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Selected Applications
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{bulkDeleteModal.selectedCount}</span>{" "}
                selected application(s)? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeBulkDeleteModal}
                  disabled={bulkDeleting}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {bulkDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    `Delete ${bulkDeleteModal.selectedCount} Application(s)`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Active Applications
                </h1>
                <p className="text-gray-600 mt-2">
                  Track and manage your account opening applications
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/accounts/open")}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              + New Application
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Active</p>
                  <p className="text-xl font-bold text-gray-900">
                    {applications.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Document Submitted</p>
                  <p className="text-xl font-bold text-gray-900">
                    {applications.filter(app => app.status === "Document Submitted").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-xl font-bold text-gray-900">
                    {applications.filter(app => app.status !== "Document Submitted").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mr-3">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Time</p>
                  <p className="text-xl font-bold text-gray-900">2-3 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar - Only show when there are applications */}
          {filteredApplications.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center">
                  <button
                    onClick={handleSelectAll}
                    className="mr-3 p-1 hover:bg-gray-100 rounded transition-colors"
                    title={selectAll ? "Deselect all" : "Select all"}
                  >
                    {selectAll ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      {selectedCount > 0 ? (
                        <>
                          <span className="font-semibold text-blue-600">{selectedCount}</span> of{" "}
                          <span className="font-semibold">{totalCount}</span> selected
                        </>
                      ) : (
                        `Select applications to perform actions`
                      )}
                    </span>
                  </div>
                </div>

                {selectedCount > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openBulkDeleteModal}
                      disabled={bulkDeleting}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedCount})
                    </button>
                    <button
                      onClick={() => setSelectedApps([])}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by application ID or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="started">Started</option>
                    <option value="personal-info-completed">Personal Info</option>
                    <option value="identity-info-completed">Identity Info</option>
                    <option value="Document Submitted">Submitted</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Active Applications
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== "all"
                  ? "No applications match your search criteria"
                  : "You don't have any active applications. Start a new application to open an account."}
              </p>
              {searchTerm || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate("/accounts/open")}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Start New Application
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start">
                          {/* Selection Checkbox */}
                          <button
                            onClick={() => handleSelectApp(app._id)}
                            className="mr-3 p-1 hover:bg-gray-100 rounded transition-colors mt-1"
                          >
                            {selectedApps.includes(app._id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              Application #{app._id?.substring(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Created: {formatDate(app.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-3 py-1.5 rounded-full border flex items-center ${getStatusColor(
                              app.status
                            )}`}
                          >
                            {getStatusIcon(app.status)}
                            <span className="ml-2 font-medium">
                              {getStatusText(app.status)}
                            </span>
                          </div>
                          
                          {/* Action Menu */}
                          <div className="relative">
                            <button
                              onClick={() => toggleActionMenu(app._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                            
                            {actionMenu === app._id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      navigate(`/applications/${app._id}`);
                                      setActionMenu(null);
                                    }}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Eye className="w-4 h-4 mr-3" />
                                    View Details
                                  </button>
                                  
                                  {app.status !== "Document Submitted" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleContinue(app);
                                          setActionMenu(null);
                                        }}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <Edit className="w-4 h-4 mr-3" />
                                        Continue Application
                                      </button>
                                      
                                      <div className="border-t border-gray-200 my-1"></div>
                                      
                                      <button
                                        onClick={() => {
                                          openDeleteModal(
                                            app._id,
                                            app._id?.substring(0, 8).toUpperCase()
                                          );
                                        }}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4 mr-3" />
                                        Delete Application
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span className="font-medium">
                            {getProgress(app.status)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${getProgress(app.status)}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        Next step:{" "}
                        <span className="font-medium text-gray-900">
                          {getNextStep(app.status)}
                        </span>
                      </p>
                    </div>

                    <div className="lg:w-48">
                      {app.status === "Document Submitted" ? (
                        <div className="space-y-3">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">
                              Application submitted for review
                            </p>
                            <button
                              disabled
                              className="w-full py-2.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              Under Review
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                              You'll be notified once verified
                            </p>
                          </div>
                          {canDeleteApplication(app.status) && (
                            <button
                              onClick={() => openDeleteModal(
                                app._id,
                                app._id?.substring(0, 8).toUpperCase()
                              )}
                              className="w-full py-2.5 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Application
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <button
                            onClick={() => handleContinue(app)}
                            className="w-full py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                          >
                            Continue Application
                          </button>
                          <button
                            onClick={() => navigate(`/applications/${app._id}`)}
                            className="w-full py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            View Details
                          </button>
                          {canDeleteApplication(app.status) && (
                            <button
                              onClick={() => openDeleteModal(
                                app._id,
                                app._id?.substring(0, 8).toUpperCase()
                              )}
                              className="w-full py-2.5 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Application
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bulk Delete Notice */}
          {selectedCount > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You have selected {selectedCount} application(s). 
                    Click the "Delete Selected" button above to delete all selected applications at once.
                    Applications under review (Document Submitted) cannot be deleted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delete Notice */}
          {applications.length > 0 && selectedCount === 0 && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Deleting an application will permanently remove all associated data. 
                    This action cannot be undone. Applications under review cannot be deleted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          {applications.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Application Process Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Application verification typically takes 1-3 business days</li>
                    <li>• Ensure all documents are clear and valid</li>
                    <li>• You'll receive email notifications at each stage</li>
                    <li>• Contact support if you need help with any step</li>
                    <li>• You can delete applications that are not yet submitted for review</li>
                    <li>• Use the checkboxes to select multiple applications for bulk actions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveApplications;
"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Activity, 
  Droplet, 
  Wind, 
  Send, 
  XCircle, 
  CheckCircle,
  Clock,
  Ban,
  FileText
} from "lucide-react";
import api from "@/lib/api";

interface EmergencyRequest {
  _id: string;
  patientName: string;
  resourceType: string;
  bedType?: string;
  bloodGroup?: string;
  quantity: number;
  priority: string;
  status: string;
  message?: string;
  createdAt: string;
}

export default function PatientRequestsPage() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    city: "",
    resourceType: "bed",
    bedType: "general",
    bloodGroup: "A_POSITIVE",
    quantity: 1,
    priority: "medium",
    message: ""
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/emergency-requests/patient");
      setRequests(res.data?.emergencyRequests || []);
    } catch (err: any) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = { ...formData };
      if (payload.resourceType !== "bed") delete (payload as any).bedType;
      if (payload.resourceType !== "blood") delete (payload as any).bloodGroup;

      await api.post("/api/emergency-requests", payload);
      setSuccess("Emergency request submitted successfully.");
      setFormData({
        ...formData,
        patientName: "",
        phone: "",
        city: "",
        quantity: 1,
        message: ""
      });
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.post(`/api/emergency-requests/${id}/cancel`);
      fetchRequests();
    } catch (err: any) {
      console.error("Failed to cancel request", err);
      alert("Failed to cancel request.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100/50 px-2 py-1 rounded text-xs font-semibold"><Clock size={12} /> Pending</span>;
      case "ACCEPTED":
        return <span className="flex items-center gap-1 text-blue-600 bg-blue-100/50 px-2 py-1 rounded text-xs font-semibold"><Activity size={12} /> Accepted</span>;
      case "COMPLETED":
        return <span className="flex items-center gap-1 text-green-600 bg-green-100/50 px-2 py-1 rounded text-xs font-semibold"><CheckCircle size={12} /> Completed</span>;
      case "CANCELLED":
        return <span className="flex items-center gap-1 text-red-600 bg-red-100/50 px-2 py-1 rounded text-xs font-semibold"><Ban size={12} /> Cancelled</span>;
      case "EXPIRED":
        return <span className="flex items-center gap-1 text-gray-500 bg-gray-100/50 px-2 py-1 rounded text-xs font-semibold"><XCircle size={12} /> Expired</span>;
      default:
        return <span className="text-gray-500 bg-gray-100/50 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
              Emergency Resource Requests
            </h1>
            <p className="text-gray-500 mt-1">
              Submit and track urgent requests for beds, blood, and oxygen.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-400" />
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="text-red-500" /> New Request
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    name="patientName"
                    required
                    value={formData.patientName}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                    placeholder="Enter patient's name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
                  <select
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                  >
                    <option value="bed">Hospital Bed</option>
                    <option value="blood">Blood</option>
                    <option value="oxygen">Oxygen Cylinder/Concentrator</option>
                  </select>
                </div>

                {formData.resourceType === "bed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type</label>
                    <select
                      name="bedType"
                      value={formData.bedType}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                    >
                      <option value="general">General Ward</option>
                      <option value="emergency">Emergency / Oxygen</option>
                      <option value="icu">ICU</option>
                      <option value="ventilator">ICU with Ventilator</option>
                    </select>
                  </div>
                )}

                {formData.resourceType === "blood" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                    >
                      <option value="A_POSITIVE">A+</option>
                      <option value="A_NEGATIVE">A-</option>
                      <option value="B_POSITIVE">B+</option>
                      <option value="B_NEGATIVE">B-</option>
                      <option value="AB_POSITIVE">AB+</option>
                      <option value="AB_NEGATIVE">AB-</option>
                      <option value="O_POSITIVE">O+</option>
                      <option value="O_NEGATIVE">O-</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message</label>
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white/50 text-sm p-2.5 border resize-none"
                    placeholder="Any specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                >
                  {submitting ? "Submitting..." : <><Send size={18} /> Submit Request</>}
                </button>
              </form>
            </div>
          </div>

          {/* Timeline / List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 min-h-[500px]">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="text-teal-600" /> Your Requests
              </h2>

              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Clock size={48} className="mb-4 opacity-50" />
                  <p>No emergency requests found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req._id} className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 hover:bg-white border border-gray-100 rounded-xl p-4 transition-all shadow-sm hover:shadow-md">
                      
                      <div className="flex gap-4 w-full md:w-auto">
                        <div className="mt-1 flex-shrink-0">
                          {req.resourceType === "bed" && <Activity className="text-blue-500" size={24} />}
                          {req.resourceType === "blood" && <Droplet className="text-red-500" size={24} />}
                          {req.resourceType === "oxygen" && <Wind className="text-teal-500" size={24} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800 capitalize">
                              {req.quantity}x {req.resourceType}
                              {req.resourceType === "bed" && req.bedType && ` (${req.bedType})`}
                              {req.resourceType === "blood" && req.bloodGroup && ` (${req.bloodGroup})`}
                            </h3>
                            {getStatusBadge(req.status)}
                            {req.priority === "critical" && (
                              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                                Critical
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            Patient: <span className="font-medium">{req.patientName}</span>
                          </p>
                          {req.message && (
                            <p className="text-sm text-gray-500 italic mt-1 line-clamp-2">
                              "{req.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {req.status === "PENDING" && (
                        <div className="mt-4 md:mt-0 w-full md:w-auto flex justify-end">
                          <button
                            onClick={() => handleCancel(req._id)}
                            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        </div>
                      )}
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

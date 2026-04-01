import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { parseVenuePDF } from '../utils/PDFVenueParser';
import { UploadCloud, CheckCircle, AlertTriangle, Lock, FileText, Info, XCircle } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "QWERTYEXAMTRACKPROUIOP@2026SEC") {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const processPDF = async () => {
    if (!file) return;
    setLoading(true);
    setMessage({ type: 'info', text: "Parsing PDF..." });
    
    try {
      const data = await parseVenuePDF(file);
      
      if (!Array.isArray(data) || data.length === 0) {
        setMessage({ type: 'error', text: "Could not extract Hall, Date, Session, or Register Numbers from this PDF format." });
        setLoading(false);
        return;
      }
      
      let totalStudents = 0;
      data.forEach(v => totalStudents += v.registerNumbers.length);
      const hallsList = data.map(v => v.hall).join(', ');
      
      setMessage({ type: 'info', text: `Found ${data.length} Halls (${hallsList}) on ${data[0].date} ${data[0].session} with ${totalStudents} students. Uploading to Firebase...` });

      if (!db) {
        setMessage({ type: 'warning', text: "Firebase is not configured yet. The PDF was parsed successfully, but data cannot be saved." });
        setLoading(false);
        return;
      }

      let successCount = 0;
      for (const venue of data) {
        if (!venue.date || !venue.session || !venue.hall) continue;
        for (const regNo of venue.registerNumbers) {
          const docId = `${regNo}_${venue.date}_${venue.session}`;
          await setDoc(doc(db, "theoryVenueOverrides", docId), {
            hall: venue.hall,
            updatedAt: new Date().toISOString()
          });
          successCount++;
        }
      }

      setMessage({ type: 'success', text: `Success! Updated ${successCount} student venues for Halls: ${hallsList} in the Live Database.` });
      
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Error processing file. Check console." });
    } finally {
      setLoading(false);
    }
  };

  const renderMessageIcon = () => {
    if (!message) return null;
    switch(message.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />;
      default: return null;
    }
  };

  const renderMessageBox = () => {
    if (!message) return null;
    let bgColor = "bg-gray-50 border-gray-200 text-gray-800";
    if (message.type === 'error') bgColor = "bg-red-50 border-red-200 text-red-800";
    if (message.type === 'success') bgColor = "bg-green-50 border-green-200 text-green-800";
    if (message.type === 'warning') bgColor = "bg-yellow-50 border-yellow-200 text-yellow-800";
    if (message.type === 'info') bgColor = "bg-blue-50 border-blue-200 text-blue-800";

    return (
      <div className={`mt-6 p-4 rounded-xl border flex items-start shadow-sm ${bgColor}`}>
        {renderMessageIcon()}
        <p className="font-medium whitespace-pre-wrap leading-relaxed">{message.text}</p>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Admin Access</h1>
          <p className="text-gray-500 text-center mb-8">Enter your secure credentials to continue to the dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className={`w-full px-4 py-3 rounded-xl border ${passwordError ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-100'} outline-none transition shadow-sm`}
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Incorrect password</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-indigo-200 flex items-center justify-center"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 pb-12 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center -rotate-3">
            <Lock className="w-6 h-6 text-indigo-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Secure Admin Dashboard</h1>
        </div>
        <p className="text-gray-500 mb-8 ml-[60px]">Upload a Final Exam Theory Venue PDF to sync venue data with the live website database.</p>
        
        <label className="border-2 border-dashed border-gray-300 rounded-3xl p-10 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition group">
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 group-hover:shadow-md">
            <UploadCloud className="w-8 h-8 text-indigo-500" />
          </div>
          <span className="text-gray-700 font-semibold text-lg">Click to browse or drag and drop</span>
          <span className="text-gray-400 mt-2 text-sm font-medium">PDF Files Only (e.g., Hall Plan.pdf)</span>
        </label>

        {file && (
          <div className="mt-6 p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mr-4 shrink-0">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 truncate">
              <span className="text-xs text-indigo-400 font-bold block uppercase tracking-wider mb-0.5">Selected File</span>
              <span className="text-indigo-900 font-semibold truncate">{file.name}</span>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); setFile(null); setMessage(null); }}
              className="p-2 hover:bg-indigo-200/50 rounded-xl transition-colors text-indigo-600"
              title="Remove file"
            >
               <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        <button 
          onClick={processPDF}
          disabled={!file || loading}
          className={`mt-6 w-full py-4 rounded-2xl font-bold text-lg text-white transition-all shadow-lg ${
            !file || loading 
              ? 'bg-gray-300 shadow-none cursor-not-allowed text-gray-500' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-indigo-200/50'
          } flex justify-center items-center`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing PDF Entries...
            </>
          ) : 'Run Database Migration'}
        </button>

        {renderMessageBox()}
      </div>
    </div>
  );
}

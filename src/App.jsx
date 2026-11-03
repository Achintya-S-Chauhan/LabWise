import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/common/Navbar';
import PresentationBanner from './components/common/PresentationBanner';
import { PRESENTATION_SLIDES } from './components/common/presentationSlides';
import OverviewView from './components/overview/OverviewView';
import LabsRequestsView from './components/labsRequests/LabsRequestsView';
import AllocationView from './components/allocation/AllocationView';
import ComparisonView from './components/analytics/ComparisonView';
import DynamicReschedulingView from './components/rescheduling/DynamicReschedulingView';
import AlgorithmLabView from './components/evalMode/AlgorithmLabView';
import TestRunnerModal from './components/testing/TestRunnerModal';

import {
  initializeDatabase,
  getAllLaboratories,
  getAllRequests,
  saveLaboratory,
  deleteLaboratory,
  saveRequest,
  deleteRequest,
  resetToOfficialDataset,
  exportFullDatabaseJSON,
  importFullDatabaseJSON,
  getSavedResult,
  saveResult
} from './db/indexedDB';

import { runFCFS } from './algorithms/fcfs';
import { runImprovedHeuristic } from './algorithms/heuristic';
import { highlightDemoTarget, clearDemoHighlight } from './utils/tourHighlight';
import './App.css';

export default function App() {
  // Modes: 'operational' | 'evaluation'
  const [appMode, setAppMode] = useState('operational');
  const [activeTab, setActiveTab] = useState('overview');
  const [evalSubTab, setEvalSubTab] = useState('visualizer');
  const [activeLabsSubTab, setActiveLabsSubTab] = useState('labs');
  const [visualizerAlgoOverride, setVisualizerAlgoOverride] = useState(null);

  // Presentation Mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [isDbReady, setIsDbReady] = useState(false);

  // Core Data
  const [labs, setLabs] = useState([]);
  const [requests, setRequests] = useState([]);

  // Allocation Results
  const [fcfsResult, setFcfsResult] = useState(null);
  const [improvedResult, setImprovedResult] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modals & Popups
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initialize from IndexedDB
  const loadDataFromDB = useCallback(async () => {
    try {
      await initializeDatabase();
      const loadedLabs = await getAllLaboratories();
      const loadedRequests = await getAllRequests();

      setLabs(loadedLabs);
      setRequests(loadedRequests);
      setIsDbReady(true);

      // Attempt to load cached results
      const savedFcfs = await getSavedResult('fcfs');
      const savedImproved = await getSavedResult('improved');

      if (savedFcfs) setFcfsResult(savedFcfs);
      if (savedImproved) setImprovedResult(savedImproved);

      // If no results, auto-run both on official dataset
      if (!savedFcfs || !savedImproved) {
        if (loadedLabs.length > 0 && loadedRequests.length > 0) {
          const fcfs = runFCFS(loadedLabs, loadedRequests);
          const improved = runImprovedHeuristic(loadedLabs, loadedRequests);
          setFcfsResult(fcfs);
          setImprovedResult(improved);
          await saveResult('fcfs', fcfs);
          await saveResult('improved', improved);
        }
      }
    } catch (err) {
      console.error('IndexedDB initialization failed:', err);
      showToast('Error loading local storage: ' + err.message, 'error');
    }
  }, []);

  useEffect(() => {
    loadDataFromDB();
  }, [loadDataFromDB]);

  // Algorithm Execution Handlers
  const handleRunFCFS = useCallback(async () => {
    setIsComputing(true);
    setTimeout(async () => {
      const result = runFCFS(labs, requests);
      setFcfsResult(result);
      await saveResult('fcfs', result);
      setIsComputing(false);
      setHasUnsavedChanges(false);
      showToast(`FCFS completed in ${result.runtimeMs}ms (${result.assignments.length} assigned, 0 conflicts)`, 'success');
    }, 50);
  }, [labs, requests]);

  const handleRunImproved = useCallback(async () => {
    setIsComputing(true);
    setTimeout(async () => {
      const result = runImprovedHeuristic(labs, requests);
      setImprovedResult(result);
      await saveResult('improved', result);
      setIsComputing(false);
      setHasUnsavedChanges(false);
      showToast(`Heuristic completed in ${result.runtimeMs}ms (${result.metrics.totalUnusedSeats} unused seats)`, 'success');
    }, 50);
  }, [labs, requests]);

  const handleRunBoth = useCallback(async () => {
    setIsComputing(true);
    setTimeout(async () => {
      const fcfs = runFCFS(labs, requests);
      const improved = runImprovedHeuristic(labs, requests);

      setFcfsResult(fcfs);
      setImprovedResult(improved);

      await saveResult('fcfs', fcfs);
      await saveResult('improved', improved);

      setIsComputing(false);
      setHasUnsavedChanges(false);

      const savedSeats = fcfs.metrics.totalUnusedSeats - improved.metrics.totalUnusedSeats;
      showToast(`Both algorithms executed! Improved Heuristic saved ${savedSeats} unused seats vs FCFS.`, 'success');
    }, 60);
  }, [labs, requests]);

  // Presentation Slide Navigation
  const handleNavigateSlide = (slideIndex) => {
    setCurrentSlideIndex(slideIndex);
    const slide = PRESENTATION_SLIDES[slideIndex];
    if (slide) {
      setAppMode(slide.targetMode);
      if (slide.targetMode === 'operational') {
        setActiveTab(slide.targetTab);
        if (slide.labsSubTab) {
          setActiveLabsSubTab(slide.labsSubTab);
        }
      } else {
        setEvalSubTab(slide.evalSubTab);
      }

      if (slide.selectedAlgo) {
        setVisualizerAlgoOverride({ algo: slide.selectedAlgo, token: Date.now() });
      }

      setTimeout(() => {
        highlightDemoTarget(slide.highlightTarget);
      }, 150);
    }
  };

  const handleTogglePresentation = (active) => {
    setIsPresentationMode(active);
    if (active) {
      handleNavigateSlide(currentSlideIndex);
    } else {
      clearDemoHighlight();
    }
  };

  const handleOpenTestLab = () => {
    setAppMode('evaluation');
    setEvalSubTab('test-lab');
    setTimeout(() => {
      highlightDemoTarget('test-laboratory');
    }, 150);
  };

  // CRUD for Laboratories
  const handleSaveLab = async (lab) => {
    try {
      await saveLaboratory(lab);
      const updated = await getAllLaboratories();
      setLabs(updated);
      setHasUnsavedChanges(true);
      showToast(`Laboratory ${lab.id} saved to IndexedDB`, 'success');
    } catch (err) {
      showToast('Failed to save laboratory: ' + err.message, 'error');
    }
  };

  const handleDeleteLab = async (id) => {
    try {
      await deleteLaboratory(id);
      const updated = await getAllLaboratories();
      setLabs(updated);
      setHasUnsavedChanges(true);
      showToast(`Laboratory ${id} deleted`, 'info');
    } catch (err) {
      showToast('Failed to delete laboratory: ' + err.message, 'error');
    }
  };

  // CRUD for Requests
  const handleSaveRequest = async (request) => {
    try {
      await saveRequest(request);
      const updated = await getAllRequests();
      setRequests(updated);
      setHasUnsavedChanges(true);
      showToast(`Request ${request.id} saved to IndexedDB`, 'success');
    } catch (err) {
      showToast('Failed to save request: ' + err.message, 'error');
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await deleteRequest(id);
      const updated = await getAllRequests();
      setRequests(updated);
      setHasUnsavedChanges(true);
      showToast(`Request ${id} deleted`, 'info');
    } catch (err) {
      showToast('Failed to delete request: ' + err.message, 'error');
    }
  };

  // Reset to Official Sample Dataset
  const handleResetOfficial = async () => {
    try {
      const reset = await resetToOfficialDataset();
      setLabs(reset.labs);
      setRequests(reset.requests);

      // Re-run algorithms on official dataset
      const fcfs = runFCFS(reset.labs, reset.requests);
      const improved = runImprovedHeuristic(reset.labs, reset.requests);
      setFcfsResult(fcfs);
      setImprovedResult(improved);
      await saveResult('fcfs', fcfs);
      await saveResult('improved', improved);

      setHasUnsavedChanges(false);
      showToast('Database successfully restored to Official Code Crack 3.0 Dataset', 'success');
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
  };

  // JSON Export / Import
  const handleExportJSON = async () => {
    try {
      const jsonStr = await exportFullDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LabWise_Database_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Complete database JSON exported successfully', 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  const handleImportJSON = async (jsonString) => {
    try {
      const importStats = await importFullDatabaseJSON(jsonString);
      const loadedLabs = await getAllLaboratories();
      const loadedRequests = await getAllRequests();
      setLabs(loadedLabs);
      setRequests(loadedRequests);

      // Re-run algorithms
      handleRunBoth();
      showToast(`Imported ${importStats.labsCount} labs and ${importStats.requestsCount} requests`, 'success');
    } catch (err) {
      showToast('Import error: ' + err.message, 'error');
    }
  };

  return (
    <div className={`app-root ${isPresentationMode ? 'presentation-mode-active' : ''}`}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPresentationMode={isPresentationMode}
        setIsPresentationMode={handleTogglePresentation}
        onResetOfficial={handleResetOfficial}
        onOpenTestRunner={handleOpenTestLab}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        isDbReady={isDbReady}
      />

      {/* Presentation Mode 5-Minute Guided Bar */}
      {isPresentationMode && (
        <PresentationBanner
          currentSlideIndex={currentSlideIndex}
          onNavigateSlide={handleNavigateSlide}
          onExitPresentation={() => handleTogglePresentation(false)}
        />
      )}

      {/* Main View Container */}
      <main className="app-container">
        {/* MODE 1: OPERATIONAL MODE */}
        {appMode === 'operational' && (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                labs={labs}
                requests={requests}
                activeSchedule={improvedResult || fcfsResult}
                fcfsResult={fcfsResult}
                improvedResult={improvedResult}
                onNavigateTab={setActiveTab}
                onRunAlgorithms={handleRunBoth}
              />
            )}

            {activeTab === 'labs-requests' && (
              <LabsRequestsView
                labs={labs}
                requests={requests}
                onSaveLab={handleSaveLab}
                onDeleteLab={handleDeleteLab}
                onSaveRequest={handleSaveRequest}
                onDeleteRequest={handleDeleteRequest}
                onResetOfficial={handleResetOfficial}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
                hasUnsavedChanges={hasUnsavedChanges}
                activeSubTab={activeLabsSubTab}
                onSubTabChange={setActiveLabsSubTab}
              />
            )}

            {activeTab === 'allocation' && (
              <AllocationView
                labs={labs}
                requests={requests}
                fcfsResult={fcfsResult}
                improvedResult={improvedResult}
                onRunFCFS={handleRunFCFS}
                onRunImproved={handleRunImproved}
                onRunBoth={handleRunBoth}
                isComputing={isComputing}
              />
            )}

            {activeTab === 'analytics' && (
              <ComparisonView
                fcfsResult={fcfsResult}
                improvedResult={improvedResult}
                requests={requests}
                onRunBoth={handleRunBoth}
              />
            )}

            {activeTab === 'rescheduling' && (
              <DynamicReschedulingView
                labs={labs}
                requests={requests}
                fcfsResult={fcfsResult}
                improvedResult={improvedResult}
              />
            )}
          </>
        )}

        {/* MODE 2: ALGORITHM LAB / EVALUATION MODE */}
        {appMode === 'evaluation' && (
          <AlgorithmLabView
            labs={labs}
            requests={requests}
            fcfsResult={fcfsResult}
            improvedResult={improvedResult}
            onRunBoth={handleRunBoth}
            initialSubTab={evalSubTab}
            onSelectSubTab={setEvalSubTab}
            visualizerAlgoOverride={visualizerAlgoOverride}
          />
        )}
      </main>

      {/* Automated Verification Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      {/* Persistent Storage Status Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <span className="footer-brand">LABWISE</span>
            <span>— Campus Laboratory Allocation & Optimization System</span>
            <span className="mode-indicator-pill">
              Mode: {appMode === 'operational' ? 'Operational' : 'Algorithm Lab (Evaluation)'}
            </span>
          </div>
          <div className="footer-right">
            <span>Client-side Persistent IndexedDB Engine</span>
            <span>•</span>
            <span>Code Crack 3.0 Evaluation Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

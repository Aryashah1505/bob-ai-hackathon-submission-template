import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  Search, 
  MapPin, 
  Cpu, 
  Activity, 
  CloudLightning, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Bell, 
  Radio,
  FileSpreadsheet,
  Layers,
  Edit2,
  X,
  AlertCircle
} from "lucide-react";
import { api } from "../api/api";

const DRAFT_KEY = "pravaha_onboarding_draft";

// Helper to generate a unique draft ID
const generateDraftId = (prefix = "id") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function SetupWizard({ onSetupCompleted, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [returnToStep, setReturnToStep] = useState(null); // Return destination after editing
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const headingRef = useRef(null);

  // Step 1: Company Details
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const [customerCount, setCustomerCount] = useState(50000);

  // Step 2: Company Verification
  const [companyInfo, setCompanyInfo] = useState({
    utility_type: "Electric Power Distribution / Transmission Utility",
    main_services: "High-Voltage Power Distribution, Substation Asset Management & Grid Reliability",
    website: "",
    description: "",
    source: "",
    is_verified: false,
  });

  // Step 3: Substations Model with stable draftId
  const [substations, setSubstations] = useState([
    { 
      draftId: "sub-init-1", 
      name: "Central Metro Substation A", 
      location: "Sector 1 Grid Yard", 
      voltageLevel: "220 kV", 
      estimatedCustomers: 25000 
    }
  ]);
  const [editingSubstationId, setEditingSubstationId] = useState(null);
  const [substationForm, setSubstationForm] = useState({
    name: "",
    location: "",
    voltageLevel: "132 kV",
    estimatedCustomers: 10000
  });

  // Delete Substation Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    substation: null,
    linkedTransformersCount: 0,
    linkedEquipmentCount: 0
  });

  // Step 4: Transformers with stable substationDraftId & draftId
  const [transformers, setTransformers] = useState([
    {
      draftId: "tr-init-1",
      substationDraftId: "sub-init-1",
      name: "TR-101 Power Step-Down",
      capacity: "50 MVA",
      installation_year: 2012,
      affected_customers: 15000,
      voltage_level: "132/33 kV",
      manufacturer: "Bharat Heavy Electricals"
    }
  ]);
  const [newTransformer, setNewTransformer] = useState({
    substationDraftId: "sub-init-1",
    name: "",
    capacity: "40 MVA",
    installation_year: 2018,
    affected_customers: 8000,
    voltage_level: "66/11 kV",
    manufacturer: ""
  });

  // Step 5: Other Equipment with stable substationDraftId & draftId
  const [otherEquipment, setOtherEquipment] = useState([]);
  const [newEquipment, setNewEquipment] = useState({
    substationDraftId: "sub-init-1",
    name: "",
    equipment_type: "Circuit Breaker",
    capacity: "2000 A",
    installation_year: 2019,
    affected_customers: 5000
  });

  // Step 6: Sensor Data Source
  const [sensorSourceType, setSensorSourceType] = useState("Simulated Live Data");
  const [selectedSensorAssetDraftId, setSelectedSensorAssetDraftId] = useState("tr-init-1");
  const [applySensorsToAll, setApplySensorsToAll] = useState(false);
  const [perAssetSensors, setPerAssetSensors] = useState({
    "tr-init-1": {
      temperature: 68.0,
      vibration: 1.4,
      partial_discharge: 12.0,
      oil_quality: 88.0,
      load_percentage: 82.0
    }
  });
  const [manualSensors, setManualSensors] = useState({
    temperature: 68.0,
    vibration: 1.4,
    partial_discharge: 12.0,
    oil_quality: 88.0,
    load_percentage: 82.0
  });

  // Step 7: Weather Data
  const [weatherMode, setWeatherMode] = useState("manual");
  const [weatherData, setWeatherData] = useState({
    source: "Manual Regional Observation",
    temperature: 29.5,
    rainfall: 12.0,
    wind_speed: 38.0,
    lightning_risk: 0.65
  });

  // Step 8: Previous Incidents
  const [hasIncidents, setHasIncidents] = useState(true);
  const [incidents, setIncidents] = useState([
    {
      draftId: "inc-init-1",
      assetDraftId: "tr-init-1",
      asset_name: "TR-101 Power Step-Down",
      incident_type: "Transformer Winding Overheating / Thermal Trip",
      severity: "High",
      outage_duration: 2.5,
      affected_customers: 6500,
      incident_date: "2025-11-20"
    }
  ]);
  const [newIncident, setNewIncident] = useState({
    assetDraftId: "tr-init-1",
    asset_name: "TR-101 Power Step-Down",
    incident_type: "Transformer Winding Overheating / Thermal Trip",
    severity: "High",
    outage_duration: 2.5,
    affected_customers: 6500,
    incident_date: "2025-11-20"
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    notification_mode: "Both",
    phone_number: "+15550192834",
    high_risk_threshold: 70.0
  });

  // 1. Toast banner auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // 2. Focus heading on step change for accessibility
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [currentStep]);

  // 3. Load Draft Onboarding State from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.region) setRegion(d.region);
        if (d.customerCount) setCustomerCount(d.customerCount);
        if (d.companyInfo) setCompanyInfo(d.companyInfo);
        if (d.substations?.length) setSubstations(d.substations);
        if (d.transformers?.length) setTransformers(d.transformers);
        if (d.otherEquipment) setOtherEquipment(d.otherEquipment);
        if (d.sensorSourceType) setSensorSourceType(d.sensorSourceType);
        if (d.perAssetSensors) setPerAssetSensors(d.perAssetSensors);
        if (d.manualSensors) setManualSensors(d.manualSensors);
        if (d.applySensorsToAll !== undefined) setApplySensorsToAll(d.applySensorsToAll);
        if (d.weatherData) setWeatherData(d.weatherData);
        if (d.incidents) setIncidents(d.incidents);
        if (d.hasIncidents !== undefined) setHasIncidents(d.hasIncidents);
        if (d.currentStep && d.currentStep > 1) setCurrentStep(d.currentStep);
        if (d.returnToStep) setReturnToStep(d.returnToStep);
      }
    } catch (e) {
      console.warn("Could not load draft onboarding state", e);
    }
  }, []);

  // 4. Persist Draft State on changes
  useEffect(() => {
    try {
      const draft = {
        companyName,
        region,
        customerCount,
        companyInfo,
        substations,
        transformers,
        otherEquipment,
        sensorSourceType,
        perAssetSensors,
        manualSensors,
        applySensorsToAll,
        weatherData,
        incidents,
        hasIncidents,
        currentStep,
        returnToStep
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      // ignore
    }
  }, [
    companyName, region, customerCount, companyInfo,
    substations, transformers, otherEquipment, sensorSourceType,
    perAssetSensors, manualSensors, applySensorsToAll, weatherData, incidents, hasIncidents,
    currentStep, returnToStep
  ]);

  // Keyboard accessibility for delete confirmation modal (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && deleteModalState.isOpen) {
        setDeleteModalState({ isOpen: false, substation: null, linkedTransformersCount: 0, linkedEquipmentCount: 0 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteModalState.isOpen]);

  // Ensure default transformer has valid substation draft ID
  useEffect(() => {
    if (substations.length > 0 && !substations.some(s => s.draftId === newTransformer.substationDraftId)) {
      setNewTransformer(prev => ({ ...prev, substationDraftId: substations[0].draftId }));
    }
    if (substations.length > 0 && !substations.some(s => s.draftId === newEquipment.substationDraftId)) {
      setNewEquipment(prev => ({ ...prev, substationDraftId: substations[0].draftId }));
    }
  }, [substations, newTransformer.substationDraftId, newEquipment.substationDraftId]);

  // ========================================================
  // SUBSTATION ACTIONS (ADD, EDIT, DELETE)
  // ========================================================

  const handleAddOrUpdateSubstation = (e) => {
    e.preventDefault();
    const name = substationForm.name.trim();
    const location = substationForm.location.trim();

    if (!name || !location) {
      setError("Substation name and physical location are required.");
      return;
    }
    if (substationForm.estimatedCustomers < 0) {
      setError("Estimated customers served cannot be negative.");
      return;
    }

    // Check duplicate normalized name and location (excluding the one currently being edited)
    const isDuplicate = substations.some(
      s => s.draftId !== editingSubstationId && 
           s.name.toLowerCase().trim() === name.toLowerCase() && 
           s.location.toLowerCase().trim() === location.toLowerCase()
    );

    if (isDuplicate) {
      setError(`A substation named "${name}" in "${location}" already exists.`);
      return;
    }

    setError(null);

    if (editingSubstationId) {
      // Update existing substation by stable draftId
      setSubstations(substations.map(s => 
        s.draftId === editingSubstationId 
          ? { ...s, name, location, voltageLevel: substationForm.voltageLevel, estimatedCustomers: Number(substationForm.estimatedCustomers) || 0 }
          : s
      ));
      setEditingSubstationId(null);
      setToastMessage("Substation updated.");
    } else {
      // Add new substation
      const newSub = {
        draftId: generateDraftId("sub"),
        name,
        location,
        voltageLevel: substationForm.voltageLevel || "132 kV",
        estimatedCustomers: Number(substationForm.estimatedCustomers) || 0
      };
      setSubstations([...substations, newSub]);
      setToastMessage("Substation added.");
    }

    // Reset form
    setSubstationForm({ name: "", location: "", voltageLevel: "132 kV", estimatedCustomers: 10000 });
  };

  const handleStartEditSubstation = (sub) => {
    setEditingSubstationId(sub.draftId);
    setSubstationForm({
      name: sub.name,
      location: sub.location,
      voltageLevel: sub.voltageLevel || "132 kV",
      estimatedCustomers: sub.estimatedCustomers || 0
    });
    setError(null);
  };

  const handleCancelEditSubstation = () => {
    setEditingSubstationId(null);
    setSubstationForm({ name: "", location: "", voltageLevel: "132 kV", estimatedCustomers: 10000 });
    setError(null);
  };

  const handlePromptDeleteSubstation = (sub) => {
    const linkedT = transformers.filter(t => t.substationDraftId === sub.draftId).length;
    const linkedE = otherEquipment.filter(e => e.substationDraftId === sub.draftId).length;

    setDeleteModalState({
      isOpen: true,
      substation: sub,
      linkedTransformersCount: linkedT,
      linkedEquipmentCount: linkedE
    });
  };

  const handleConfirmDeleteSubstation = () => {
    const sub = deleteModalState.substation;
    if (!sub) return;

    // 1. Remove Substation
    const updatedSubstations = substations.filter(s => s.draftId !== sub.draftId);
    setSubstations(updatedSubstations);

    // 2. Cascade delete linked transformers & other equipment
    const remainingTransformers = transformers.filter(t => t.substationDraftId !== sub.draftId);
    const deletedTransformerDraftIds = transformers
      .filter(t => t.substationDraftId === sub.draftId)
      .map(t => t.draftId);
    
    setTransformers(remainingTransformers);
    setOtherEquipment(otherEquipment.filter(e => e.substationDraftId !== sub.draftId));

    // 3. Remove incidents linked to deleted assets
    setIncidents(incidents.filter(i => !deletedTransformerDraftIds.includes(i.assetDraftId)));

    // Exit editing mode if deleting the substation currently in form
    if (editingSubstationId === sub.draftId) {
      handleCancelEditSubstation();
    }

    setDeleteModalState({ isOpen: false, substation: null, linkedTransformersCount: 0, linkedEquipmentCount: 0 });
    setToastMessage(
      deleteModalState.linkedTransformersCount > 0 || deleteModalState.linkedEquipmentCount > 0
        ? "Substation and linked draft assets removed."
        : "Substation removed."
    );
  };

  // Step 1 -> 2: Company Preview & Verification
  const handleStep1Next = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !region.trim()) {
      setError("Please enter Company Name and Operating Region.");
      return;
    }
    setError(null);
    setLoading(true);
    setStatusMessage("Searching public records & registry...");

    try {
      const preview = await api.previewCompanyInfo({
        company_name: companyName.trim(),
        region: region.trim()
      });
      setCompanyInfo({
        utility_type: preview.utility_type || "Electric Power Distribution / Transmission Utility",
        main_services: preview.main_services || "High-Voltage Power Distribution & Grid Reliability",
        website: preview.website || `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        description: preview.description || `Regional electric utility operating in ${region}.`,
        source: preview.source || "Google Search API Integration",
        is_verified: false
      });
      handleAdvanceStep(2);
    } catch (err) {
      console.warn("Lookup fallback:", err);
      setCompanyInfo({
        utility_type: "Electric Power Distribution / Transmission Utility",
        main_services: "Substation Asset Management & Regional Grid Reliability",
        website: `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        description: `Electric power grid utility entity operating across ${region}.`,
        source: "Manual Operator Review Required",
        is_verified: false
      });
      handleAdvanceStep(2);
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  // Step 4: Add Transformer
  const handleAddTransformer = () => {
    if (!newTransformer.name.trim()) {
      setError("Transformer name or ID tag is required.");
      return;
    }
    if (newTransformer.installation_year > new Date().getFullYear()) {
      setError("Installation year cannot be in the future.");
      return;
    }
    if (!substations.some(s => s.draftId === newTransformer.substationDraftId)) {
      setError("Please select a valid registered substation.");
      return;
    }

    setError(null);
    const addedTr = {
      ...newTransformer,
      draftId: generateDraftId("tr")
    };
    setTransformers([...transformers, addedTr]);
    setNewTransformer({
      substationDraftId: substations[0]?.draftId || "",
      name: "",
      capacity: "40 MVA",
      installation_year: 2018,
      affected_customers: 8000,
      voltage_level: "66/11 kV",
      manufacturer: ""
    });
    setToastMessage("Transformer added.");
  };

  // Step 5: Add Other Equipment
  const handleAddEquipment = () => {
    if (!newEquipment.name.trim()) {
      setError("Equipment name is required.");
      return;
    }
    setError(null);
    setOtherEquipment([...otherEquipment, { ...newEquipment, draftId: generateDraftId("eq") }]);
    setNewEquipment({
      substationDraftId: substations[0]?.draftId || "",
      name: "",
      equipment_type: "Circuit Breaker",
      capacity: "2000 A",
      installation_year: 2020,
      affected_customers: 4000
    });
    setToastMessage("Equipment item added.");
  };

  // Step 8: Add Incident
  const handleAddIncident = () => {
    if (!newIncident.incident_type.trim()) {
      setError("Incident description/type is required.");
      return;
    }
    setError(null);
    setIncidents([...incidents, { ...newIncident, draftId: generateDraftId("inc") }]);
    setNewIncident({
      assetDraftId: transformers[0]?.draftId || "tr-1",
      asset_name: transformers[0]?.name || "Primary Transformer",
      incident_type: "Feeder Line Flashover",
      severity: "Medium",
      outage_duration: 1.5,
      affected_customers: 3000,
      incident_date: new Date().toISOString().split("T")[0]
    });
    setToastMessage("Historical incident added.");
  };

  // Step Navigation Helper with Return-To-Review support
  const handleAdvanceStep = (defaultNext) => {
    setError(null);
    if (returnToStep) {
      const target = returnToStep;
      setReturnToStep(null);
      setCurrentStep(target);
    } else {
      setCurrentStep(defaultNext);
    }
  };

  // Jump to specific step for editing (from Review)
  const handleJumpToStep = (stepNum) => {
    setError(null);
    setReturnToStep(9); // Return back to Review step (Step 9) on Next
    setCurrentStep(stepNum);
  };

  // Final Step: Submit and Save Transaction
  const handleFinalSubmit = async () => {
    // 1. Dependency Validation Check
    const missingSubstations = transformers.filter(t => !substations.some(s => s.draftId === t.substationDraftId));
    if (missingSubstations.length > 0) {
      setError(`Validation Error: Transformer "${missingSubstations[0].name}" is linked to a removed substation. Please update its substation link before submitting.`);
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage("Saving company data transactionally to Supabase...");

    // Map draft substation IDs to numeric array indexes for the backend transactional mapper
    const subIdIndexMap = {};
    substations.forEach((s, idx) => {
      subIdIndexMap[s.draftId] = idx;
    });

    // Helper to get deterministic simulated values for an asset if in simulated mode
    const getSimulatedValues = (name, index, installYear) => {
      let hash = 0;
      const str = `${name}-${index}-${installYear}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const absHash = Math.abs(hash);
      const tempSeed = (absHash % 45) + 52.0; // 52 to 97 C
      const loadSeed = ((absHash >> 2) % 55) + 45.0; // 45 to 100%
      const vibSeed = (((absHash >> 4) % 25) / 10.0) + 0.8; // 0.8 to 3.3 mm/s
      const pdSeed = ((absHash >> 3) % 35) + 4.0; // 4 to 39 pC
      const oilSeed = 100.0 - ((absHash >> 1) % 40); // 60 to 100%

      return {
        temperature: Math.round(tempSeed * 10) / 10,
        load_percentage: Math.round(loadSeed * 10) / 10,
        vibration: Math.round(vibSeed * 10) / 10,
        partial_discharge: Math.round(pdSeed * 10) / 10,
        oil_quality: Math.round(oilSeed * 10) / 10
      };
    };

    const combinedAssets = [
      ...transformers.map((t, idx) => {
        let sensorVals;
        if (sensorSourceType === "Simulated Live Data") {
          sensorVals = getSimulatedValues(t.name, idx, t.installation_year);
        } else if (applySensorsToAll) {
          sensorVals = manualSensors;
        } else {
          sensorVals = perAssetSensors[t.draftId] || manualSensors;
        }

        return {
          substation_temp_index: subIdIndexMap[t.substationDraftId] !== undefined ? subIdIndexMap[t.substationDraftId] : 0,
          name: t.name,
          asset_type: "Transformer",
          capacity: t.capacity,
          installation_year: Number(t.installation_year) || 2015,
          affected_customers: Number(t.affected_customers) || 0,
          operating_condition: "Good",
          previous_failure_count: incidents.filter((i) => i.assetDraftId === t.draftId).length,
          sensor_data_source: sensorSourceType === "Simulated Live Data" 
            ? "Simulated Live Data — demonstration only" 
            : "Manual Operator Input",
          temperature: Number(sensorVals.temperature) || 65.0,
          vibration: Number(sensorVals.vibration) || 1.2,
          partial_discharge: Number(sensorVals.partial_discharge) || 10.0,
          oil_quality: Number(sensorVals.oil_quality) || 90.0,
          load_percentage: Number(sensorVals.load_percentage) || 75.0
        };
      }),
      ...otherEquipment.map((e, idx) => {
        let sensorVals;
        if (sensorSourceType === "Simulated Live Data") {
          sensorVals = getSimulatedValues(e.name, 100 + idx, e.installation_year);
        } else if (applySensorsToAll) {
          sensorVals = manualSensors;
        } else {
          sensorVals = perAssetSensors[e.draftId] || {
            temperature: 55.0,
            vibration: 0.8,
            partial_discharge: 5.0,
            oil_quality: 95.0,
            load_percentage: 60.0
          };
        }

        return {
          substation_temp_index: subIdIndexMap[e.substationDraftId] !== undefined ? subIdIndexMap[e.substationDraftId] : 0,
          name: e.name,
          asset_type: e.equipment_type || "Circuit Breaker",
          capacity: e.capacity,
          installation_year: Number(e.installation_year) || 2018,
          affected_customers: Number(e.affected_customers) || 0,
          operating_condition: "Good",
          previous_failure_count: incidents.filter((i) => i.assetDraftId === e.draftId).length,
          sensor_data_source: sensorSourceType === "Simulated Live Data" 
            ? "Simulated Live Data — demonstration only" 
            : "Manual Operator Input",
          temperature: Number(sensorVals.temperature) || 55.0,
          vibration: Number(sensorVals.vibration) || 0.8,
          partial_discharge: Number(sensorVals.partial_discharge) || 5.0,
          oil_quality: Number(sensorVals.oil_quality) || 95.0,
          load_percentage: Number(sensorVals.load_percentage) || 60.0
        };
      })
    ];

    const payload = {
      company_name: companyName.trim(),
      region: region.trim(),
      customer_count: Number(customerCount) || 0,
      description: companyInfo.description,
      website: companyInfo.website,
      substations: substations.map((s) => ({ name: s.name, location: s.location })),
      assets: combinedAssets,
      weather: {
        source: weatherMode === "manual" ? "Manual Regional Input" : "Regional Meteorologic Sensor",
        temperature: Number(weatherData.temperature) || 28.0,
        rainfall: Number(weatherData.rainfall) || 0.0,
        wind_speed: Number(weatherData.wind_speed) || 15.0,
        lightning_risk: Number(weatherData.lightning_risk) || 0.1
      },
      incidents: hasIncidents ? incidents.map((inc) => {
        const foundIdx = [...transformers, ...otherEquipment].findIndex((a) => a.draftId === inc.assetDraftId);
        return {
          asset_temp_index: foundIdx >= 0 ? foundIdx : 0,
          incident_type: inc.incident_type,
          severity: inc.severity,
          outage_duration: Number(inc.outage_duration) || 1.0,
          affected_customers: Number(inc.affected_customers) || 0
        };
      }) : [],
      notifications: notifications
    };

    try {
      const res = await api.submitOnboarding(payload);
      const newCompanyId = res.company_id || res.industry_id;

      setStatusMessage("Analyzing grid equipment & generating company risk profile...");
      await api.analyzeCompany(newCompanyId).catch(() => {});

      // Clear draft storage only on success
      localStorage.removeItem(DRAFT_KEY);

      onSetupCompleted({
        id: newCompanyId,
        name: res.company_name || companyName.trim(),
        region: region.trim(),
        customer_count: Number(customerCount) || 0
      });
    } catch (err) {
      setError(err.message || "Failed to persist company grid infrastructure.");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const steps = [
    "1. Company",
    "2. Verification",
    "3. Substations",
    "4. Transformers",
    "5. Equipment",
    "6. Sensors",
    "7. Weather",
    "8. Incidents",
    "9. Review"
  ];

  return (
    <div className="page-container" style={{ maxWidth: "860px", margin: "1.5rem auto" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border-strong)",
          color: "var(--text-primary)",
          padding: "12px 18px",
          borderRadius: "var(--radius-sm)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 999,
          fontSize: "var(--text-sm)",
          fontWeight: 600
        }}>
          <CheckCircle2 size={16} style={{ color: "var(--status-success)" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Step Progress Stepper */}
      <div className="glass-panel" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", overflowX: "auto", gap: "0.5rem" }}>
          {steps.map((stepLabel, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button 
                key={stepNum} 
                type="button"
                onClick={() => isCompleted && setCurrentStep(stepNum)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.35rem", 
                  fontSize: "0.725rem",
                  fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent ? "var(--cyan)" : isCompleted ? "var(--green)" : "var(--text-dim)",
                  whiteSpace: "nowrap",
                  background: "transparent",
                  border: "none",
                  cursor: isCompleted ? "pointer" : "default"
                }}
              >
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: isCurrent ? "rgba(56,189,248,0.2)" : isCompleted ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isCurrent ? "var(--cyan)" : isCompleted ? "var(--green)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem"
                }}>
                  {isCompleted ? "✓" : stepNum}
                </div>
                <span>{stepLabel.split(". ")[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Loading Banner */}
      {loading && (
        <div style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)", color: "var(--cyan)", padding: "0.85rem 1.25rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", fontWeight: 600 }}>
          <div className="status-dot pulse" style={{ background: "var(--cyan)" }}></div>
          <span>{statusMessage || "Processing..."}</span>
        </div>
      )}

      {/* Error Banner with role="alert" */}
      {error && (
        <div role="alert" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#f87171", padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION DIALOG / MODAL
          ======================================================== */}
      {deleteModalState.isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "480px", padding: "1.75rem", border: "1px solid var(--border-strong)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", color: "var(--status-danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>
                  Remove {deleteModalState.substation?.name}?
                </h3>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {deleteModalState.substation?.location}
                </span>
              </div>
            </div>

            {deleteModalState.linkedTransformersCount > 0 || deleteModalState.linkedEquipmentCount > 0 ? (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--status-danger)" }}>Dependency Warning:</strong>
                <p style={{ marginTop: "0.25rem" }}>
                  This substation has <strong>{deleteModalState.linkedTransformersCount} linked transformer{deleteModalState.linkedTransformersCount > 1 ? "s" : ""}</strong>
                  {deleteModalState.linkedEquipmentCount > 0 ? ` and ${deleteModalState.linkedEquipmentCount} equipment item(s)` : ""}.
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                  Removing this substation will also remove its associated draft assets and related incidents.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Are you sure you want to remove this substation from your draft?
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button 
                type="button" 
                className="btn-icon" 
                onClick={() => setDeleteModalState({ isOpen: false, substation: null, linkedTransformersCount: 0, linkedEquipmentCount: 0 })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleConfirmDeleteSubstation}
                style={{ background: "var(--status-danger)" }}
              >
                {deleteModalState.linkedTransformersCount > 0 || deleteModalState.linkedEquipmentCount > 0
                  ? "Remove Substation and linked items"
                  : "Remove Substation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 1: WELCOME & COMPANY DETAILS
          ======================================================== */}
      {currentStep === 1 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "rgba(56,189,248,0.1)", color: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Building2 size={28} />
            </div>
            <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Welcome to PRAVAHA</h1>
            <p style={{ color: "var(--cyan)", fontSize: "0.85rem", fontWeight: 700, marginTop: "0.2rem" }}>
              Smarter Insights. Stronger Grids.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem", maxWidth: "520px", margin: "0.5rem auto 0" }}>
              Set up your grid assets to identify equipment risks before outages occur.
            </p>
          </div>

          <form onSubmit={handleStep1Next}>
            <div className="form-group">
              <label className="form-label">Company / Utility Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter company or utility name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Operating Region / Territory *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter operating region or territory"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Customer Base</label>
                <div className="input-suffix-wrapper">
                  <input
                    type="number"
                    className="input-field input-with-suffix"
                    placeholder="e.g. 150000"
                    value={customerCount}
                    onChange={(e) => setCustomerCount(e.target.value)}
                    min="0"
                  />
                  <span className="input-suffix">users</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
              {onCancel ? (
                <button type="button" className="btn-icon" onClick={onCancel}>Cancel</button>
              ) : <div></div>}
              <button type="submit" className="btn-primary" disabled={loading}>
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          STEP 2: COMPANY LOOKUP AND CONFIRMATION
          ======================================================== */}
      {currentStep === 2 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Search size={24} style={{ color: "var(--cyan)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Company Information Confirmation</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Verify company details. Review or edit before proceeding.
              </p>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div className="form-grid-2" style={{ marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Region</label>
                <input
                  type="text"
                  className="input-field"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Industry / Utility Type</label>
              <input
                type="text"
                className="input-field"
                value={companyInfo.utility_type}
                onChange={(e) => setCompanyInfo({ ...companyInfo, utility_type: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Main Work / Services</label>
              <input
                type="text"
                className="input-field"
                value={companyInfo.main_services}
                onChange={(e) => setCompanyInfo({ ...companyInfo, main_services: e.target.value })}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Public Website</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Source Attribution</label>
                <div style={{ padding: "0.6rem 0.85rem", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: "var(--radius-sm)", color: "var(--cyan)", fontSize: "0.85rem", fontWeight: 600 }}>
                  {companyInfo.source || "Manual Entry / Verified by Operator"}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Public Description</label>
              <textarea
                className="input-field"
                rows={3}
                value={companyInfo.description}
                onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(1)}>
              <ArrowLeft size={16} />
              <span>Edit Details</span>
            </button>
            <button className="btn-primary" onClick={() => handleAdvanceStep(3)}>
              <span>Confirm Company</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: SUBSTATION SETUP (WITH ROBUST ADD/EDIT/DELETE)
          ======================================================== */}
      {currentStep === 3 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <MapPin size={24} style={{ color: "var(--cyan)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Add Substations</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Add the substations operated by this company. You can edit these details later before final submission.
              </p>
            </div>
          </div>

          {/* Added Substations List Table / Cards */}
          <div style={{ marginBottom: "1.75rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Added Substations ({substations.length})
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.6rem" }}>
              {substations.map((sub) => {
                const isBeingEdited = editingSubstationId === sub.draftId;
                const linkedT = transformers.filter(t => t.substationDraftId === sub.draftId).length;

                return (
                  <div 
                    key={sub.draftId} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      background: isBeingEdited ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.02)", 
                      border: `1px solid ${isBeingEdited ? "var(--cyan)" : "var(--border)"}`, 
                      padding: "0.85rem 1.15rem", 
                      borderRadius: "var(--radius-sm)" 
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{sub.name}</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        {sub.location} · {sub.voltageLevel || "132 kV"} · {(sub.estimatedCustomers || 0).toLocaleString()} customers
                        {linkedT > 0 && (
                          <span style={{ marginLeft: "0.5rem", color: "var(--cyan)", fontWeight: 600 }}>
                            ({linkedT} transformer{linkedT > 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        type="button"
                        className="btn-icon"
                        onClick={() => handleStartEditSubstation(sub)}
                        aria-label={`Edit ${sub.name}`}
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button 
                        type="button"
                        className="btn-icon"
                        onClick={() => handlePromptDeleteSubstation(sub)}
                        aria-label={`Delete ${sub.name}`}
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem", borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add / Edit Substation Form */}
          <form onSubmit={handleAddOrUpdateSubstation} style={{ background: "rgba(0,0,0,0.3)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase" }}>
                {editingSubstationId ? "✏️ Edit Substation Details" : "+ Add a Substation"}
              </span>
              {editingSubstationId && (
                <button type="button" onClick={handleCancelEditSubstation} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <X size={13} />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Substation Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Anand Substation"
                  value={substationForm.name}
                  onChange={(e) => setSubstationForm({ ...substationForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter location / city / coordinates"
                  value={substationForm.location}
                  onChange={(e) => setSubstationForm({ ...substationForm, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Voltage Level (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 66kV"
                  value={substationForm.voltageLevel}
                  onChange={(e) => setSubstationForm({ ...substationForm, voltageLevel: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Customers Served</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 5000"
                  value={substationForm.estimatedCustomers}
                  onChange={(e) => setSubstationForm({ ...substationForm, estimatedCustomers: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary">
                {editingSubstationId ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    <span>Add Substation</span>
                  </>
                )}
              </button>
              {editingSubstationId && (
                <button type="button" className="btn-icon" onClick={handleCancelEditSubstation}>
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>
          </form>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(2)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button 
              className="btn-primary" 
              onClick={() => {
                if (substations.length === 0) {
                  setError("At least one substation is required before proceeding.");
                  return;
                }
                setError(null);
                handleAdvanceStep(4);
              }}
            >
              <span>{returnToStep === 9 ? "Save & Return to Review" : "Next: Transformer Setup"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 4: TRANSFORMER SETUP
          ======================================================== */}
      {currentStep === 4 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Cpu size={24} style={{ color: "var(--cyan)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Transformer Setup</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Configure primary step-down & distribution transformers.</p>
            </div>
          </div>

          {/* Configured Transformers Table */}
          <div style={{ marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Configured Transformers ({transformers.length})</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              {transformers.map((t) => {
                const linkedSub = substations.find(s => s.draftId === t.substationDraftId);
                return (
                  <div key={t.draftId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>{t.name}</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--cyan)", marginLeft: "0.5rem" }}>
                        • Substation: {linkedSub ? linkedSub.name : "Unlinked Substation"}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginLeft: "0.5rem" }}>
                        • {t.capacity} • Installed: {t.installation_year} • {t.affected_customers} customers
                      </span>
                    </div>
                    {transformers.length > 1 && (
                      <button 
                        onClick={() => setTransformers(transformers.filter(x => x.draftId !== t.draftId))} 
                        style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer" }}
                        aria-label={`Delete ${t.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Transformer Form */}
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>
              + Add Transformer
            </span>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Assigned Substation *</label>
                <select
                  className="input-field"
                  value={newTransformer.substationDraftId}
                  onChange={(e) => setNewTransformer({ ...newTransformer, substationDraftId: e.target.value })}
                >
                  {substations.map((s) => (
                    <option key={s.draftId} value={s.draftId}>{s.name} ({s.location})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transformer Name / Tag *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. T-101"
                  value={newTransformer.name}
                  onChange={(e) => setNewTransformer({ ...newTransformer, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity (MVA) *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 10 MVA"
                  value={newTransformer.capacity}
                  onChange={(e) => setNewTransformer({ ...newTransformer, capacity: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Installation Year *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 2018"
                  value={newTransformer.installation_year}
                  onChange={(e) => setNewTransformer({ ...newTransformer, installation_year: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Affected Customers *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 5000"
                  value={newTransformer.affected_customers}
                  onChange={(e) => setNewTransformer({ ...newTransformer, affected_customers: Number(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Voltage Level (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 33/11 kV"
                  value={newTransformer.voltage_level}
                  onChange={(e) => setNewTransformer({ ...newTransformer, voltage_level: e.target.value })}
                />
              </div>
            </div>

            <button type="button" className="btn-icon" onClick={handleAddTransformer} style={{ marginTop: "0.5rem" }}>
              <Plus size={14} />
              <span>Add Another Transformer</span>
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(3)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button 
              className="btn-primary" 
              onClick={() => {
                if (transformers.length === 0) {
                  setError("At least one transformer must be registered.");
                  return;
                }
                setError(null);
                handleAdvanceStep(5);
              }}
            >
              <span>{returnToStep === 9 ? "Save & Return to Review" : "Next: Other Equipment"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 5: OTHER EQUIPMENT SETUP
          ======================================================== */}
      {currentStep === 5 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Layers size={24} style={{ color: "var(--cyan)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Other Equipment Setup (Optional)</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Add circuit breakers, feeder lines, or switchgear.</p>
            </div>
          </div>

          {otherEquipment.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Additional Grid Equipment ({otherEquipment.length})</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                {otherEquipment.map((eq) => {
                  const linkedSub = substations.find(s => s.draftId === eq.substationDraftId);
                  return (
                    <div key={eq.draftId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <div>
                        <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>{eq.name}</strong>
                        <span style={{ fontSize: "0.8rem", color: "var(--violet)", marginLeft: "0.5rem" }}>({eq.equipment_type})</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--cyan)", marginLeft: "0.5rem" }}>• Substation: {linkedSub ? linkedSub.name : "General"}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginLeft: "0.5rem" }}>• Rating: {eq.capacity}</span>
                      </div>
                      <button onClick={() => setOtherEquipment(otherEquipment.filter(x => x.draftId !== eq.draftId))} style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Equipment Form */}
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>
              + Add Equipment Item
            </span>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Equipment Type *</label>
                <select
                  className="input-field"
                  value={newEquipment.equipment_type}
                  onChange={(e) => setNewEquipment({ ...newEquipment, equipment_type: e.target.value })}
                >
                  <option value="Circuit Breaker">Circuit Breaker</option>
                  <option value="Feeder">Feeder Line</option>
                  <option value="Switchgear">Switchgear Unit</option>
                  <option value="Other">Other Equipment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Equipment Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. CB-Feeder-East"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Related Substation</label>
                <select
                  className="input-field"
                  value={newEquipment.substationDraftId}
                  onChange={(e) => setNewEquipment({ ...newEquipment, substationDraftId: e.target.value })}
                >
                  {substations.map((s) => (
                    <option key={s.draftId} value={s.draftId}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Capacity / Rating</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 1600 A"
                  value={newEquipment.capacity}
                  onChange={(e) => setNewEquipment({ ...newEquipment, capacity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Impacted Customers</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 4000"
                  value={newEquipment.affected_customers}
                  onChange={(e) => setNewEquipment({ ...newEquipment, affected_customers: Number(e.target.value) })}
                />
              </div>
            </div>

            <button type="button" className="btn-icon" onClick={handleAddEquipment} style={{ marginTop: "0.5rem" }}>
              <Plus size={14} />
              <span>Add Equipment</span>
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(4)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-icon" onClick={() => handleAdvanceStep(6)}>
                <span>Skip for Now</span>
              </button>
              <button className="btn-primary" onClick={() => handleAdvanceStep(6)}>
                <span>{returnToStep === 9 ? "Save & Return to Review" : "Next: Sensor Data"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 6: SENSOR DATA SETUP
          ======================================================== */}
      {currentStep === 6 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Activity size={24} style={{ color: "var(--cyan)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Sensor Data Setup</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>How do you want to provide sensor data?</p>
            </div>
          </div>

          {/* 4 Choices */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { id: "Simulated Live Data", label: "1. Simulated Live Data", sub: "Generate realistic prototype telemetry", status: "Active" },
              { id: "Manual Input", label: "2. Manual Input", sub: "Specify exact temperature, vibration, load values", status: "Active" },
              { id: "CSV Upload", label: "3. CSV Upload", sub: "Expected: asset_name, timestamp, temp, vibration...", status: "CSV endpoint required" },
              { id: "Live Sensor API", label: "4. Live Sensor API", sub: "Direct SCADA/IoT HTTP push hook", status: "Coming soon" }
            ].map((choice) => (
              <div 
                key={choice.id}
                onClick={() => choice.status === "Active" && setSensorSourceType(choice.id)}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-sm)",
                  background: sensorSourceType === choice.id ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${sensorSourceType === choice.id ? "var(--cyan)" : "var(--border)"}`,
                  cursor: choice.status === "Active" ? "pointer" : "not-allowed",
                  opacity: choice.status === "Active" ? 1 : 0.6
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{choice.label}</strong>
                  <span style={{ fontSize: "0.7rem", color: choice.status === "Active" ? "var(--green)" : "var(--amber)", fontWeight: 700 }}>
                    {choice.status}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{choice.sub}</p>
              </div>
            ))}
          </div>

          {/* Simulated Mode Banner */}
          {sensorSourceType === "Simulated Live Data" && (
            <div style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--cyan)", fontWeight: 700 }}>Telemetry Attribution:</span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "0.25rem" }}>
                <strong>Simulated Live Data — demonstration only.</strong> This data is generated for prototype testing and is not received from physical sensors.
              </p>
            </div>
          )}

          {/* Manual Input Form */}
          {sensorSourceType === "Manual Input" && (
            <div style={{ background: "rgba(0,0,0,0.25)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase" }}>
                  Manual Physical Sensor Parameters
                </span>
                
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={applySensorsToAll}
                    onChange={(e) => setApplySensorsToAll(e.target.checked)}
                  />
                  <span>Apply these values to all assets</span>
                </label>
              </div>

              {!applySensorsToAll && (
                <div style={{ marginBottom: "1rem" }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Configure Telemetry For Asset:</label>
                  <select
                    className="input-field"
                    value={selectedSensorAssetDraftId}
                    onChange={(e) => setSelectedSensorAssetDraftId(e.target.value)}
                    style={{ borderColor: "var(--cyan)" }}
                  >
                    {transformers.map((t) => (
                      <option key={t.draftId} value={t.draftId}>
                        {t.name} (Transformer • {t.capacity} • {t.installation_year})
                      </option>
                    ))}
                    {otherEquipment.map((eq) => (
                      <option key={eq.draftId} value={eq.draftId}>
                        {eq.name} ({eq.equipment_type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(() => {
                const currentVals = applySensorsToAll 
                  ? manualSensors 
                  : (perAssetSensors[selectedSensorAssetDraftId] || manualSensors);

                const updateCurrentVals = (updated) => {
                  if (applySensorsToAll) {
                    setManualSensors(updated);
                  } else {
                    setPerAssetSensors({
                      ...perAssetSensors,
                      [selectedSensorAssetDraftId]: updated
                    });
                  }
                };

                return (
                  <>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label className="form-label">Operating Temperature (°C) *</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 68"
                          value={currentVals.temperature ?? ""}
                          onChange={(e) => updateCurrentVals({ ...currentVals, temperature: Number(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Vibration (mm/s) *</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field"
                          placeholder="e.g. 1.2"
                          value={currentVals.vibration ?? ""}
                          onChange={(e) => updateCurrentVals({ ...currentVals, vibration: Number(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Partial Discharge (pC) *</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 10"
                          value={currentVals.partial_discharge ?? ""}
                          onChange={(e) => updateCurrentVals({ ...currentVals, partial_discharge: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Dielectric Oil Quality (%) *</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 90"
                          value={currentVals.oil_quality ?? ""}
                          onChange={(e) => updateCurrentVals({ ...currentVals, oil_quality: Number(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Operating Load (%) *</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 75"
                          value={currentVals.load_percentage ?? ""}
                          onChange={(e) => updateCurrentVals({ ...currentVals, load_percentage: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(5)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button className="btn-primary" onClick={() => handleAdvanceStep(7)}>
              <span>{returnToStep === 9 ? "Save & Return to Review" : "Next: Weather Information"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 7: WEATHER INFORMATION
          ======================================================== */}
      {currentStep === 7 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <CloudLightning size={24} style={{ color: "var(--amber)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Weather Information</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Regional meteorological hazard context for {region}.</p>
            </div>
          </div>

          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
            Live weather API connection is optional. Enter current regional observation conditions manually below:
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Ambient Temperature (°C)</label>
              <input
                type="number"
                className="input-field"
                value={weatherData.temperature}
                onChange={(e) => setWeatherData({ ...weatherData, temperature: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Wind Speed (mph)</label>
              <input
                type="number"
                className="input-field"
                value={weatherData.wind_speed}
                onChange={(e) => setWeatherData({ ...weatherData, wind_speed: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Rainfall (mm/hr)</label>
              <input
                type="number"
                className="input-field"
                value={weatherData.rainfall}
                onChange={(e) => setWeatherData({ ...weatherData, rainfall: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lightning Risk (0.0 - 1.0)</label>
              <input
                type="number"
                step="0.05"
                className="input-field"
                value={weatherData.lightning_risk}
                onChange={(e) => setWeatherData({ ...weatherData, lightning_risk: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(6)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button className="btn-primary" onClick={() => handleAdvanceStep(8)}>
              <span>{returnToStep === 9 ? "Save & Return to Review" : "Next: Previous Incidents"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 8: PREVIOUS INCIDENTS
          ======================================================== */}
      {currentStep === 8 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <AlertTriangle size={24} style={{ color: "var(--amber)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Previous Incidents</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Has this equipment failed before?</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <button
              type="button"
              className={`btn-icon ${!hasIncidents ? "active" : ""}`}
              onClick={() => { setHasIncidents(false); setIncidents([]); }}
              style={{ padding: "0.6rem 1.25rem", borderColor: !hasIncidents ? "var(--cyan)" : "var(--border)" }}
            >
              No Previous Incidents
            </button>
            <button
              type="button"
              className={`btn-icon ${hasIncidents ? "active" : ""}`}
              onClick={() => setHasIncidents(true)}
              style={{ padding: "0.6rem 1.25rem", borderColor: hasIncidents ? "var(--amber)" : "var(--border)" }}
            >
              Yes, Add Previous Incidents
            </button>
          </div>

          {hasIncidents && (
            <div>
              {incidents.map((inc) => (
                <div key={inc.draftId} style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "0.5rem", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>{inc.incident_type}</strong>
                    <span style={{ color: "var(--amber)", fontSize: "0.8rem", marginLeft: "0.5rem" }}>({inc.severity} Severity)</span>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Target: {inc.asset_name} • Duration: {inc.outage_duration}h • Impact: {inc.affected_customers} customers</p>
                  </div>
                  <button onClick={() => setIncidents(incidents.filter(x => x.draftId !== inc.draftId))} style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", margin: "1rem 0" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>
                  + Record Historical Incident
                </span>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Which Asset Failed? *</label>
                    <select
                      className="input-field"
                      value={newIncident.assetDraftId}
                      onChange={(e) => {
                        const selTr = transformers.find(t => t.draftId === e.target.value);
                        const selEq = otherEquipment.find(eq => eq.draftId === e.target.value);
                        setNewIncident({
                          ...newIncident,
                          assetDraftId: e.target.value,
                          asset_name: selTr ? selTr.name : selEq ? selEq.name : "Asset"
                        });
                      }}
                    >
                      {transformers.map((t) => (
                        <option key={t.draftId} value={t.draftId}>{t.name} (Transformer)</option>
                      ))}
                      {otherEquipment.map((eq) => (
                        <option key={eq.draftId} value={eq.draftId}>{eq.name} ({eq.equipment_type})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Failure Type *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Winding Flashover"
                      value={newIncident.incident_type}
                      onChange={(e) => setNewIncident({ ...newIncident, incident_type: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <select
                      className="input-field"
                      value={newIncident.severity}
                      onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Outage Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="input-field"
                      value={newIncident.outage_duration}
                      onChange={(e) => setNewIncident({ ...newIncident, outage_duration: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customers Affected</label>
                    <input
                      type="number"
                      className="input-field"
                      value={newIncident.affected_customers}
                      onChange={(e) => setNewIncident({ ...newIncident, affected_customers: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <button type="button" className="btn-icon" onClick={handleAddIncident} style={{ marginTop: "0.5rem" }}>
                  <Plus size={14} />
                  <span>Add Incident</span>
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(7)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button className="btn-primary" onClick={() => handleAdvanceStep(9)}>
              <span>{returnToStep === 9 ? "Save & Return to Review" : "Next: Review All Data"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 9: REVIEW ALL INFORMATION & SUBMIT
          ======================================================== */}
      {currentStep === 9 && (
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <CheckCircle2 size={24} style={{ color: "var(--green)" }} />
            <div>
              <h2 ref={headingRef} tabIndex={-1} style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", outline: "none" }}>Review All Information</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Verify full infrastructure manifest before saving to Supabase.</p>
            </div>
          </div>

          {/* Section Summary Cards with Edit Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {/* 1. Company */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Company & Region</span>
                <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{companyName} — {region}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{(Number(customerCount) || 0).toLocaleString()} customers</p>
              </div>
              <button className="btn-icon" onClick={() => handleJumpToStep(1)} aria-label="Edit Company Details">
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            </div>

            {/* 2. Substations Read-Only Summary */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Substations Network ({substations.length})
                  </span>
                </div>
                <button className="btn-icon" onClick={() => handleJumpToStep(3)} aria-label="Edit Substations">
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {substations.map((s) => {
                  const linkedTCount = transformers.filter(t => t.substationDraftId === s.draftId).length;
                  return (
                    <div key={s.draftId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>• {s.name} ({s.location})</span>
                      <span style={{ color: "var(--cyan)", fontSize: "0.8rem" }}>
                        {s.voltageLevel || "132 kV"} · {linkedTCount} transformer{linkedTCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Transformers & Equipment */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Transformers & Other Assets</span>
                <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{transformers.length} Transformers • {otherEquipment.length} Other Equipment Items</p>
              </div>
              <button className="btn-icon" onClick={() => handleJumpToStep(4)} aria-label="Edit Transformers">
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            </div>

            {/* 4. Sensor & Weather */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Telemetry & Meteorological Ingestion</span>
                <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>Source: {sensorSourceType}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Weather: {weatherData.temperature}°C, {weatherData.wind_speed} mph wind, {weatherData.rainfall} mm rain</p>
              </div>
              <button className="btn-icon" onClick={() => handleJumpToStep(6)} aria-label="Edit Sensor and Weather Settings">
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            </div>

            {/* 5. Incidents */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Historical Incidents</span>
                <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{hasIncidents ? `${incidents.length} recorded historical failures` : "No previous incidents provided"}</p>
              </div>
              <button className="btn-icon" onClick={() => handleJumpToStep(8)} aria-label="Edit Incidents">
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Simulation Warning Pill */}
          {sensorSourceType === "Simulated Live Data" && (
            <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              ⚠️ <strong>Note:</strong> This dashboard will use simulated sensor readings for demonstration purposes.
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn-icon" onClick={() => setCurrentStep(8)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button 
              className="btn-primary" 
              onClick={handleFinalSubmit} 
              disabled={loading}
              style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? "Saving company data..." : "Submit and Save"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { Box, Grid, Alert, useTheme } from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import useDashboard from '../hooks/useDashboard';
import { getSeverityColor, getTimeRangeLabel, formatTimestamp, getStatusColor } from '../utils/dashboardUtils';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import InstancesTable from '../components/dashboard/InstancesTable';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import ResourceUsageChart from '../components/dashboard/ResourceUsageChart';

const Dashboard = () => {
  const theme = useTheme();
  const {
    // States
    loading,
    refreshing,
    error,
    autoRefresh,
    autoRefreshInterval,
    dashboardData,
    searchQuery,
    selectedProject,
    selectedZone,
    timeRange,
    projects,
    zones,
    filteredInstances,

    // Handlers
    handleRefresh,
    handleAutoRefreshChange,
    handleIntervalChange,
    handleTimeRangeChange,
    handleSearchChange,
    handleSearchSubmit,
    handleProjectChange,
    handleZoneChange,
    handleAddInstance,
    handleEditInstance,
    handleDeleteInstance
  } = useDashboard();

  return (
    <Box>
      <DashboardHeader
        timeRange={timeRange}
        autoRefresh={autoRefresh}
        autoRefreshInterval={autoRefreshInterval}
        refreshing={refreshing}
        onTimeRangeChange={handleTimeRangeChange}
        onAutoRefreshChange={handleAutoRefreshChange}
        onIntervalChange={handleIntervalChange}
        onRefresh={handleRefresh}
        onAddInstance={handleAddInstance}
        getTimeRangeLabel={getTimeRangeLabel}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Instances" 
            value={dashboardData.stats.instances} 
            icon={<StorageIcon sx={{ color: theme.palette.primary.light }} />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="CPU Usage" 
            value={`${dashboardData.stats.cpuUsage}%`} 
            icon={<MemoryIcon sx={{ color: theme.palette.info.light }} />}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Memory Usage" 
            value={`${dashboardData.stats.memoryUsage}%`} 
            icon={<NetworkIcon sx={{ color: theme.palette.success.light }} />}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Alerts" 
            value={dashboardData.stats.alerts} 
            icon={<WarningIcon sx={{ color: theme.palette.warning.light }} />}
            color="warning"
            loading={loading}
          />
        </Grid>
      </Grid>
      
      <InstancesTable
        loading={loading}
        refreshing={refreshing}
        instances={filteredInstances}
        searchQuery={searchQuery}
        selectedProject={selectedProject}
        selectedZone={selectedZone}
        projects={projects}
        zones={zones}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onProjectChange={handleProjectChange}
        onZoneChange={handleZoneChange}
        onEditInstance={handleEditInstance}
        onDeleteInstance={handleDeleteInstance}
        getStatusColor={getStatusColor}
      />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ResourceUsageChart
            data={dashboardData.resourceData}
            timeRange={timeRange}
            loading={loading}
            stats={dashboardData.stats}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AlertsPanel
            loading={loading}
            alerts={dashboardData.alerts}
            getSeverityColor={(severity) => getSeverityColor(severity, theme)}
            formatTimestamp={formatTimestamp}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
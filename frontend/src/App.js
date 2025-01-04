import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { Tabs, Tab, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import Logo from './assets/logo.svg';


const App = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [embedConfigs, setEmbedConfigs] = useState([]);
    const refreshTimers = useRef([]);

    const theme = createTheme({
        palette: {
        primary: {
            main: '#1a73e8', // Primary color for unselected tabs
        },
        secondary: {
            main: '#4444CF', // Secondary color (for selected tab indicator)
        },
        },
        components: {
        // Customize the MuiTab component
        MuiTab: {
            styleOverrides: {
            root: {
                '&.Mui-selected': {
                color: '#4444CF', // Color for the selected tab
                fontWeight: 'bold',
                fontSize: 13
                },
                color: '#000', // Color for unselected tabs
                fontSize: 13,
                textTransform: 'none'
            },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#4444CF', // Indicator color when a tab is selected
                },
            },
        },
        },
    });

    const refreshToken = useCallback(async (reportId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/embedded-tokens?reportId=${reportId}`
            );

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            setEmbedConfigs((prevConfigs) =>
                prevConfigs.map((config) =>
                    config.id === reportId
                        ? { ...config, accessToken: data.accessToken }
                        : config
                )
            );

            scheduleTokenRefresh(reportId, data.expiration);
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    }, []);

    const scheduleTokenRefresh = useCallback((reportId, expiration) => {
        const safetyBuffer = 30000; // Refresh 30 seconds before expiry
        const timeUntilRefresh = expiration - Date.now() - safetyBuffer;

        if (timeUntilRefresh > 0) {
            const timer = setTimeout(() => refreshToken(reportId), timeUntilRefresh);
            refreshTimers.current.push(timer);
        }
    }, [refreshToken]);

    useEffect(() => {
        const fetchEmbedTokens = async () => {
            try {
                const reports = [
                    {
                        reportName: 'Overview Dashboard',
                        reportId: '4897aab3-ef46-466b-867b-23aa22b033b7',
                        datasetId: 'c6c7d2c8-27be-4d0d-8ded-e4e5885234ea',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Additional Information',
                        reportId: '352db40b-5ff8-497a-9f94-93c6982b09f8',
                        datasetId: '50fefb0c-d2b8-43c7-8680-d11e790d8827',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Recruitment Report',
                        reportId: 'd5731494-75b4-4321-967e-d85aff736e82',
                        datasetId: '21a9d960-b45a-4f24-84da-d63c88d004d9',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Detailed Report',
                        reportId: '859b41b3-81f1-4e59-a7f4-435c51a978b1',
                        datasetId: 'b10b65cd-68f8-4360-8acf-3b338411c1e0',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Business Metrics',
                        reportId: 'ec95beeb-b3a6-4a28-a95e-01d1e08f599b',
                        datasetId: '047047e7-ca13-46c4-ac2d-6e8cf1ce4edb',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Onboarding & Compliance',
                        reportId: '48befd00-dc1b-4dcb-b6d1-b2a96fdbf20b',
                        datasetId: '7e26e446-b580-4363-9e4c-a28c58f0824e',
                        navContentPaneEnabled: true
                    },
                    {
                        reportName: 'Cera Report',
                        reportId: 'c2a5cf8c-a33b-4759-b90d-68405d6d3d47',
                        datasetId: 'afe11b3f-5fc7-4ffb-968e-602a710010c1',
                        navContentPaneEnabled: false
                    },
                    
                    
                ];
    
                const configs = await Promise.all(
                    reports.map(async (report) => {
                        const response = await fetch(
                            `http://localhost:5000/api/embedded-tokens?reportId=${report.reportId}&datasetId=${report.datasetId}`
                        );
    
                        if (!response.ok) {
                            const data = await response.json();
                            throw new Error(data.message || 'Failed to fetch embed token');
                        }
    
                        const data = await response.json();
    
                        return {
                            reportName: report.reportName, // Include the report name
                            type: 'report',
                            id: report.reportId,
                            embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=${report.reportId}',
                            viewMode: models.ViewMode.View,
                            accessToken: data.accessToken,
                            tokenType: models.TokenType.Embed,
                            permissions: models.Permissions.All,
                            settings: {
                                navContentPaneEnabled: report.navContentPaneEnabled,
                                panes: {
                                    filters: {
                                        expanded: false,
                                        visible: true,
                                    },
                                },
                                background: models.BackgroundType.Transparent,
                            },
                        };
                    })
                );
    
                setEmbedConfigs(configs);
            } catch (error) {
                console.error('Error fetching embed tokens:', error);
            }
        };

        fetchEmbedTokens();

        return () => {
            // Clear timers on unmount
            refreshTimers.current.forEach(clearTimeout);
        };
    }, [scheduleTokenRefresh]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    if (embedConfigs.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="App">
            <div className="logo-container">
                <img src={Logo} alt="App Logo" className="app-logo" />
            </div>
            <ThemeProvider theme={theme}>
                <Box sx={{ display: 'flex', height: '100vh', height: '100%' }}>
                    <Tabs  
                        orientation="vertical"
                        variant="scrollable" 
                        value={selectedTab} 
                        onChange={handleTabChange} 
                        aria-label="Power BI report tabs"
                        sx={{ borderRight: 1, borderColor: 'divider' }}
                    >
                        {embedConfigs.map((config, index) => (
                            <Tab 
                                key={config.id} 
                                label={config.reportName} 
                                sx={{
                                    alignItems: 'flex-start',
                                    textAlign: 'left',
                                }}
                            />
                        ))}
                    </Tabs>
                    <Box sx={{ flex: 1 }}>
                        <div className="report-container">
                            {embedConfigs.map((config, index) => (
                                <div
                                    key={config.id}
                                    style={{
                                        display: selectedTab === index ? 'block' : 'none',
                                        width: '100%',
                                        height: '100%', // Ensure it uses the full height
                                    }}
                                >
                                    <PowerBIEmbed
                                        embedConfig={config}
                                        cssClassName="report-style-class"
                                        onLoad={() => console.log('Report loaded successfully')}
                                        onError={(event) => console.error('Error embedding report:', event.detail)}
                                        onRendered={() => console.log('Report rendered successfully')}
                                    />
                                </div>
                            ))}
                        </div>

                    </Box>
                </Box>
            </ThemeProvider>
        </div>
    );
};

export default App;

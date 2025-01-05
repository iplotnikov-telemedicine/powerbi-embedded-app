import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { Tabs, Tab, Box, Typography } from '@mui/material';
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
                        reportId: '38e15711-7270-46bf-bedf-ec8c544bd8c4',
                        datasetId: 'e1a1b12f-be58-46f6-8c29-aa220d33da74',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Additional Information',
                        reportId: 'ec6738bc-b7e7-483b-a699-d8769ce40359',
                        datasetId: 'e1a1b12f-be58-46f6-8c29-aa220d33da74',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Recruitment Report',
                        reportId: 'e13c1290-10cd-477a-92aa-e41d232aa8b1',
                        datasetId: 'e1a1b12f-be58-46f6-8c29-aa220d33da74',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Detailed Report',
                        reportId: '2b8bba03-f61d-4acb-a76e-a9ab69d85f5f',
                        datasetId: 'e1a1b12f-be58-46f6-8c29-aa220d33da74',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Business Metrics',
                        reportId: '8b349589-7c29-44fe-92e5-465eed911328',
                        datasetId: '76b0b299-6c4f-4b00-874f-819c819c5a86',
                        navContentPaneEnabled: false
                    },
                    {
                        reportName: 'Onboarding & Compliance',
                        reportId: 'f57b98d0-5c30-491c-9da1-1d94887c1385',
                        datasetId: '4536ad7b-f908-4899-9ee7-948619739aa5',
                        navContentPaneEnabled: true
                    },
                    {
                        reportName: 'Cera Report',
                        reportId: 'd03e28f5-26a1-487a-82e9-48092dfcfc4e',
                        datasetId: '9063ee5b-98f2-4fbe-8f01-63c952787c19',
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
                            embedUrl: 'https://app.powerbi.com/reportEmbed',
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
                        sx={{ borderRight: 1, borderColor: 'divider', backgroundColor: 'white' }}
                    >
                        <Typography
                            variant="body1" 
                            sx={{
                            fontWeight: 'bold',
                                color: 'black', // Matches the style in the screenshot
                                margin: 2, // Spacing below the text
                            }}
                        >Reports</Typography>
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

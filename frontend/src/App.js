import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import './App.css';

const App = () => {
    const [embedConfig, setEmbedConfig] = useState(null);

    useEffect(() => {
        // Fetch the embed configuration from the backend
        const fetchEmbedConfig = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/report-details'); // Adjust endpoint as needed
                const data = await response.json();

                if (response.ok) {
                    setEmbedConfig({
                        type: 'report',
                        id: data.reportId,
                        embedUrl: data.embedUrl,
                        viewMode: models.ViewMode.View,
                        accessToken: data.accessToken,
                        tokenType: models.TokenType.Embed,
                        permissions: models.Permissions.All,
                        settings: {
                            panes: {
                                filters: {
                                    expanded: false,
                                    visible: true,
                                },
                            },
                            background: models.BackgroundType.Transparent,
                        }
                    });
                } else {
                    console.error('Error fetching embed config:', data.message);
                }
            } catch (error) {
                console.error('Error fetching embed config:', error);
            }
        };

        fetchEmbedConfig();
    }, []);

    if (!embedConfig) {
        return <div>Loading...</div>;
    }

    return (
        <div className="App">
            <h1>Embedded Power BI Report</h1>
            <PowerBIEmbed
                embedConfig={embedConfig}
                cssClassName="report-style-class"
                onLoad={() => console.log('Report loaded successfully')}
                onError={(event) => console.error('Error embedding report:', event.detail)}
                onRendered={() => console.log('Report rendered successfully')}
            />
        </div>
    );
};

export default App;

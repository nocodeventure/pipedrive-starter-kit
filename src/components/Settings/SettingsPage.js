import React, { useEffect, useState } from 'react';
import SurfaceSDK from '@pipedrive/app-extensions-sdk';

import SettingsNavigation from '../SettingsNavigation';
import SettingsInput from '../SettingsInput';
import ApiClient from '../../utils/api-client';
import SETTINGS_TABS from '../../constants/settings-tabs';

import './style.css';

const sdk = new SurfaceSDK();
const apiClient = new ApiClient(sdk);

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'German' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'it', label: 'Italian' },
];

const urlSearchParams = new URLSearchParams(window.location.search);

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('business');
    const [userData, setUserData] = useState(null);
    const [appLanguage, setAppLanguage] = useState('en');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initSettings = async () => {
            try {
                await sdk.initialize({ size: { height: 600 } });

                const userId = urlSearchParams.get('userId');
                const companyId = urlSearchParams.get('companyId');
                const token = urlSearchParams.get('token');

                if (userId && companyId) {
                    const userUrl = `/settings/user/me/${userId}/${companyId}`;
                    const result = await apiClient.fetchWithToken(userUrl, 'GET', null, token);
                    
                    if (result.success && result.data) {
                        const systemId = urlSearchParams.get('systemId');
                        setUserData({
                            ...result.data,
                            systemId: systemId || `${Date.now()}x${Math.random().toString().slice(2)}`
                        });
                        
                        if (result.data.language?.language_code) {
                            setAppLanguage(result.data.language.language_code);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initSettings();
    }, []);

    const handleLanguageChange = (newLanguage) => {
        setAppLanguage(newLanguage);
    };

    if (loading) {
        return (
            <div className="settings-page">
                <SettingsNavigation tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="settings-page__loading">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="settings-page">
                <SettingsNavigation tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="settings-page__error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <SettingsNavigation tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            
            <main className="settings-page__content">
                {activeTab === 'business' && (
                    <>
                        {/* Personal / Business information */}
                        <section className="settings-section">
                            <h2 className="settings-section__title">Personal / Business information</h2>
                            <p className="settings-section__desc">
                                This is the information we have received from you and stored within our secured database environment.
                            </p>
                            
                            <div className="settings-fields">
                                <SettingsInput label="Your Name" value={userData?.name} />
                                <SettingsInput label="Company Name" value={userData?.company_name} />
                                <SettingsInput label="Company Domain" value={userData?.company_domain} />
                                
                                <div className="settings-fields__row">
                                    <SettingsInput label="Country Code" value={userData?.company_country || 'N/A'} />
                                    <SettingsInput label="Language Code" value={userData?.language?.language_code} />
                                    <SettingsInput label="Language Locale" value={userData?.locale} />
                                </div>
                            </div>
                        </section>

                        {/* App Language */}
                        <section className="settings-section">
                            <h2 className="settings-section__title">App Language</h2>
                            <p className="settings-section__desc">Change the application's language</p>
                            
                            <SettingsInput 
                                value={appLanguage}
                                type="select"
                                options={LANGUAGE_OPTIONS}
                                onChange={handleLanguageChange}
                            />
                        </section>

                        {/* Other information */}
                        <section className="settings-section">
                            <h2 className="settings-section__title">Other information</h2>
                            <p className="settings-section__desc">
                                This is other information we record on your behalf in order to make this app work.
                            </p>
                            
                            <div className="settings-fields">
                                <div className="settings-fields__row">
                                    <SettingsInput label="User ID" value={userData?.id?.toString()} />
                                    <SettingsInput label="Company ID" value={userData?.company_id?.toString()} />
                                </div>
                                <SettingsInput label="User System ID" value={userData?.systemId} />
                            </div>
                        </section>

                        {/* Scopes */}
                        <section className="settings-section">
                            <h2 className="settings-section__title">Scopes</h2>
                            <p className="settings-section__desc">
                                To ensure a seamless integration between Pipedrive and Stripe, our app requires specific permissions or scopes. Here's a summary of the scopes we need and why:
                            </p>

                            <div className="settings-scope">
                                <h4 className="settings-scope__title">Access to basic information:</h4>
                                <p className="settings-scope__text">
                                    We request access to your name, email, and profile picture to personalize your experience within our app.
                                </p>
                            </div>

                            <div className="settings-scope">
                                <h4 className="settings-scope__title">Deals: Read only:</h4>
                                <p className="settings-scope__text">
                                    We need read-only access to retrieve deal information from your Pipedrive account, including deal names, statuses, values, and associated contacts. This allows us to display and sync deal data with Stripe.
                                </p>
                            </div>

                            <div className="settings-scope">
                                <h4 className="settings-scope__title">Contacts: Full access:</h4>
                                <p className="settings-scope__text">
                                    Full access to contacts enables us to manage and sync contact information between Pipedrive and Stripe, ensuring seamless integration.
                                </p>
                            </div>

                            <div className="settings-scope">
                                <h4 className="settings-scope__title">Products: Full access:</h4>
                                <p className="settings-scope__text">
                                    Full access to products allows us to manage and sync product details between Pipedrive and Stripe, ensuring consistency across platforms. This feature will be included in a future release.
                                </p>
                            </div>

                            <div className="settings-scope">
                                <h4 className="settings-scope__title">Read users data:</h4>
                                <p className="settings-scope__text">
                                    This permission allows us to retrieve user-specific information from Pipedrive, such as preferences or settings, to customize your app experience.
                                </p>
                            </div>

                            <p className="settings-section__desc" style={{ marginTop: "2em" }}>
                                These permissions ensure efficient data synchronization while prioritizing your privacy and security. If you have any questions, please don't hesitate to contact us.
                            </p>
                        </section>
                    </>
                )}

                {activeTab !== 'business' && (
                    <div className="settings-page__placeholder">
                        {SETTINGS_TABS.find(t => t.id === activeTab)?.label} tab coming soon...
                    </div>
                )}
            </main>
        </div>
    );
};

export default SettingsPage;

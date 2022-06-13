import React, {Fragment, useEffect, useMemo, useState} from "react";
import Header from "../../components/Header";
import {useLocation, useNavigate} from "react-router-dom";
import {useStoreActions} from "easy-peasy";
import { Formik, Field, Form, FieldArray, useFormikContext } from "formik"
import {saveConnection, testConnection} from "../../api/DataSourceApi";
import DataSourceDTO from "../../data/dto/DataSourceDTO";
import styles from './styles';
import Button from "../../components/Common/Button";

const DataSourceConfiguration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getDataSources } = useStoreActions(({ dataSources }) => dataSources);
    const [isConnected, setIsConnected] = useState(false);
    const [isTestConnectionLoading, setIsTestConnectionLoading] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [testConnectionClicked, setTestConnectionClicked] = useState(false);
    const selectedSource = useMemo(() => {
        return new DataSourceDTO({...location.state.dataSourceDTO})
    }, [location.state.dataSourceDTO]);
    const initialConnectionParameters = selectedSource ? selectedSource.connectionParameters : [];

    useEffect(() => {
        if (selectedSource) {
            setIsConnected(typeof selectedSource.connected === 'undefined' ? false : selectedSource.connected)
        }
    }, [selectedSource]);

    const saveConfiguration = async ({dataSourceId, config}) => {
        setIsSaveLoading(true);

        try {
            const res = await saveConnection({
                id: dataSourceId,
                config: generateConfig(selectedSource.dataCatalogItemId, config)
            })

            if (res.status === 200) {
                await getDataSources(); // Refresh
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save configuration");
        } finally {
            setIsSaveLoading(false);
            setTestConnectionClicked(true);
            navigate(-1);
        }
    }

    const testConfigConnection = async ({dataSourceId, config}) => {
        setIsTestConnectionLoading(true);

        try {
            const res = await testConnection({
                id: dataSourceId,
                config: generateConfig(selectedSource.dataCatalogItemId, config)
            });

            if (res.status === 200){
                const connected = res.data.connected;
                setIsConnected(connected)
            }
        } catch (error) {
            console.error(error);
            setIsConnected(false);
            alert("Failed to test connection");
        }

        setIsTestConnectionLoading(false);
        setTestConnectionClicked(true);
    }

    const preProcessConnectionParameters = (connectionParameters) => {
        if (selectedSource) {
            switch (selectedSource.dataCatalogItemId) {
                case 'postgres':
                    return connectionParameters
                case 'snowflake':
                    return connectionParameters
                case 'bigquery':
                    return connectionParameters.map((el) => {
                        const stringValue = JSON.stringify(el.value,null, 2);
                        const newValue = stringValue.length === 2 ? '' : stringValue;

                        return {
                            ...el,
                            value: newValue
                        }
                    });
                default:
                    return connectionParameters;
            }
        }

        return connectionParameters;

    }

    const generateConfig = (type, config) => {
        switch (type){
            case 'bigquery':
                return {
                    credentials_json: JSON.parse(getValue(config,'credentials_json'))
                };
            case 'postgres':
                return parseArrayIntoConfig(config);
            case 'snowflake':
                return parseFlakeIntoConfig(config);
            default:
                return null;
        }
    }

    const parseArrayIntoConfig = (arr) => {
        return {
            "host": getValue(arr,'host'),
            "port": parseInt(getValue(arr,'port')),
            "user": getValue(arr,'user'),
            "password": getValue(arr,'password'),
            "database": getValue(arr,'database')
        }
    };

    const parseFlakeIntoConfig = (arr) => {
        return {
            "user": getValue(arr,'user'),
            "password": getValue(arr,'password'),
            "role": getValue(arr,'role'),
            "database": getValue(arr,'database'),
            "warehouse": getValue(arr, 'warehouse'),
            "account" : getValue(arr,'account'),
            "organization" : getValue(arr,'organization')
        }
    };

    const getValue = (arr, key) => {
        return arr.filter((item) => item.id === key)[0].value
    };

    const renderBigQueryForm = (conParams, i) => {
        return (
            <div className={styles.bigQueryFormContainer}>
                <div className={styles.bigQueryFormTitle}>
                    Credentials JSON :
                </div>

                <div className={styles.bigQueryFormSubtitle}>
                    Check out the {}
                    <a
                        className={styles.bigQueryDocsLink}
                        target={"_blank"}
                        href={"https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-gcloud"}
                        rel="noreferrer"
                    >
                        docs
                    </a>
                    {} for more information on how to obtain this file.
                </div>

                <div className={styles.bigQueryParamsContainer}>
                    <Field
                        name={`connectionParameters[${i}].value`}
                        type={'textField'}
                        className={`${styles.bigQueryParams}${conParams.value ? ' min-h-[336px]' : ' min-h-[32px]'}`}
                        placeholder={'Copy-paste the content of your credentials file here'}
                        component={'textarea'}
                        key={conParams.id}
                    />

                    {!conParams.value &&
                        <div className={styles.bigQueryParamsPlaceholder}>
                            <p>{`{`}</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"type": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"project_id": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"private_key_id": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"private_key": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"client_email": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"client_id": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"auth_uri": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"token_uri": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"auth_provider_x509_cert_url": "",</p>
                            <p className={styles.bigQueryParamsPlaceholderLine}>"client_x509_cert_url": ""</p>
                            <p>{`}`}</p>
                        </div>
                    }
                </div>
            </div>
        );
    }

    const renderConnectionParameter = (conParams, i) => {
        return (
            <Fragment>
                <div className={styles.connectionParameterNameContainer}>
                    <div className={styles.connectionParameterName}>
                        {conParams.id}
                    </div>
                </div>

                <div className={styles.connectionParameterInputContainer}>
                    <Field
                        className={styles.connectionParameterInput}
                        name={`connectionParameters[${i}].value`}
                        type={conParams.id === 'password' ? 'password' : 'text'}
                        placeholder={conParams.id}
                        key={conParams.id}
                    />
                </div>
            </Fragment>
        )
    }

    const renderConnectionParameters = (values) => {
        return (
            <Fragment>
                {values.connectionParameters.map((conParams, i) => {
                    return (
                        <div
                            className={styles.dataSourceConfigForm}
                            key={conParams.id}
                        >
                            {selectedSource.dataCatalogItemId === 'bigquery' ?
                                renderBigQueryForm(conParams, i) :
                                renderConnectionParameter(conParams, i)
                            }
                        </div>
                    )
                })}
            </Fragment>
        );
    };

    const ConnectionControls = React.memo(() => {
        const { submitForm, values  } = useFormikContext();

        return (
            <div className={styles.connectionControlsContainer}>
                <div className={styles.connectionTestButtonContainer}>
                    <Button
                        text={'Test connection'}
                        disabled={isTestConnectionLoading}
                        solid={false}
                        onClick={async () => {
                            setIsTestConnectionLoading(true);
                            await testConfigConnection({
                                dataSourceId: selectedSource.id,
                                config: values.connectionParameters
                            });
                        }}
                    />

                    <span
                        className={`
                            ${styles.connectionTestResult}
                            ${isConnected ? 'text-kuwala-green' : 'text-kuwala-red'}
                            ${testConnectionClicked ? '' : 'hidden'}
                        `}
                    >
                        {isConnected ? 'Success!' : 'Failed'}
                    </span>
                </div>

                <Button
                    text={'Save'}
                    disabled={isSaveLoading}
                    onClick={submitForm}
                />
            </div>
        );
    });

    const renderDataSourceConfigForm = ({ values }) => {
        if (!selectedSource || !values.connectionParameters) {
            return (
                <div>
                    Undefined data source, something is wrong.
                </div>
            )
        }

        return (
            <Form>
                <FieldArray
                    name={'connectionParameters'}
                    render={() => {
                        return (
                            <div className={styles.dataSourceConfigFormContainer}>
                                {renderConnectionParameters(values)}

                                <ConnectionControls />
                            </div>
                        )
                    }}
                />
            </Form>
        )
    }

    const renderSelectedSource = () => {
        return (
            selectedSource &&
            <div className={styles.dataSourceContainer}>
                <img
                    className={styles.dataSourceLogo}
                    alt={'Data source logo'}
                    src={selectedSource.logo}
                />

                <div className={styles.dataSourceName}>
                    {selectedSource.name}
                </div>

                <div className={`${styles.dataSourceConnectionStatus} ${isConnected ? "bg-kuwala-green" : "bg-red-400"}`} />
            </div>
        )

    }

    const renderHeader = () => {
        return (
            <Fragment>
                <Header />

                <div className={styles.headerContainer}>
                    {renderSelectedSource()}

                    <div className={styles.titleContainer}>
                        <div className={styles.title}>
                            Data Pipeline Configuration
                        </div>

                        <div className={styles.subtitle}>
                            Setup and configure your data pipeline
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }

    const renderConfiguration = () => {
        return (
            <div className={styles.configurationContainer}>
                <Formik
                    initialValues={{
                        connectionParameters: preProcessConnectionParameters(initialConnectionParameters)
                    }}
                    onSubmit={async (values) => {
                        await saveConfiguration({
                            dataSourceId: selectedSource.id,
                            config: values.connectionParameters
                        });
                    }}
                    children={renderDataSourceConfigForm}
                />
            </div>
        );
    }

    const renderFooter = () => {
        return (
            <div className={styles.footerContainer}>
                <Button
                    text={'Back'}
                    onClick={() => navigate(-1)}
                />
            </div>
        )
    }

    return (
        <div className={styles.pageContainer}>
            <main className={styles.pageContentContainer}>
                {renderHeader()}
                {renderConfiguration()}
                {renderFooter()}
            </main>
        </div>
    )
};

export default DataSourceConfiguration;

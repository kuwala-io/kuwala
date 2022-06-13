import React, {useState, useEffect, Fragment} from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import {useStoreActions, useStoreState} from "easy-peasy";
import styles from "./styles";
import Button from "../../components/Common/Button";

const DataCatalog = () => {
    const { availableDataSources, savingDataSources } = useStoreState(({ dataSources }) => dataSources);
    const {
        setAvailableDataSources,
        getAvailableDataSources,
        setSelectedSources,
        saveSelectedSources
    } = useStoreActions(({ dataSources }) => dataSources)
    const [isItemSelected, setIsItemSelected] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        getAvailableDataSources();
    }, [getAvailableDataSources]);

    const selectDataSource = (index) => {
        const newDS = [...availableDataSources]
        newDS[index].isSelected = !newDS[index].isSelected;

        setAvailableDataSources(newDS)
        setIsItemSelected(scanSelected())
    }

    const saveSelection = async () => {
        setSelectedSources(availableDataSources.filter((d) => d.isSelected));
        await saveSelectedSources();
        setSelectedSources(availableDataSources.map((d) => ({ ...d, isSelected: false })));
        navigate('/data-pipeline-management');
    }

    const scanSelected = () => {
        let selected = false;

        for (let elements of availableDataSources) {
            if (elements.isSelected) {
                selected = true;
                break;
            }
        }

        return selected
    }


    const renderDataSources = () => {
        return (
            <div className={styles.dataSourcesContainer}>
                {!availableDataSources.length ?
                    <div>
                        No data sources available
                    </div> :
                    availableDataSources.map((e,i) => {
                        return (
                            <div
                                className={`${styles.dataSourceContainer} ${e.isSelected ? 'border-kuwala-green border-4' : ''}`}
                                key={i}
                                onClick={() => {
                                    selectDataSource(i)
                                }}
                            >
                                <img
                                    className={styles.dataSourceLogo}
                                    alt={'Data source logo'}
                                    src={e.logo}
                                />

                                <div className={styles.dataSourceName}>
                                    {e.name}
                                </div>
                            </div>
                        )
                    })
                }
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

                <Button
                    text={'Add data sources'}
                    disabled={!isItemSelected || savingDataSources}
                    onClick={saveSelection}
                    loading={savingDataSources}
                />
            </div>
        );
    }

    const renderHeading = () => {
        return (
            <Fragment>
                <div className={styles.title}>
                    Data Catalog
                </div>

                <div className={styles.subtitle}>
                    Select the data source you want to connect
                </div>
            </Fragment>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <Header />

            <main className={styles.bodyContainer}>
                {renderHeading()}
                {renderDataSources()}
                {renderFooter()}
            </main>
        </div>
    )
};

export default DataCatalog;

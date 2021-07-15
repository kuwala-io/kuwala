import questionary
from hdx.hdx_configuration import Configuration
from hdx.data.organization import Organization


def select_dataset():
    Configuration.create(hdx_site='prod', user_agent='Kuwala', hdx_read_only=True)
    datasets = Organization.read_from_hdx(identifier='74ad0574-923d-430b-8d52-ad80256c4461').get_datasets(
        query='Population')
    datasets = sorted(
        filter(
            lambda d: 'population' in d['title'].lower() and 'csv' in d['file_types'],
            map(
                lambda d: dict(id=d.get('id'), title=d.get('title'), location=d.get_location_names(),
                               file_types=d.get_filetypes()),
                datasets
            )
        ), key=lambda d: d['location'][0])
    countries = list(map(lambda d: d['location'][0], datasets))
    country = questionary.select('For which country do you want to download the population data?', choices=countries) \
        .ask()

    return datasets[countries.index(country)]['id']


if __name__ == '__main__':
    dataset = select_dataset()

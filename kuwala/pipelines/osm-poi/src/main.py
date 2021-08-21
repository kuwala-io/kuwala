import questionary
import sys

sys.path.insert(0, '../../../common/')
sys.path.insert(0, '../')

from Downloader import Downloader
from Processor import Processor

if __name__ == '__main__':
    choices = ['Download', 'Process']
    option = questionary.select('What do you want to do?', choices=choices).ask()

    if option == choices[0]:
        Downloader.start()
    else:
        Processor.start()

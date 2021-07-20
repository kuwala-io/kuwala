from Downloader import Downloader
from Processor import Processor

if __name__ == '__main__':
    files, output_dir = Downloader.start()

    Processor.start(files, output_dir)


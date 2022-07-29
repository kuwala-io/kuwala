import pandas


def txt_to_csv(file_path):
    read_file = pandas.read_csv(
        file_path, delimiter="\t", header=None, low_memory=False
    )
    read_file.to_csv(file_path.replace(".txt", ".csv"), index=None, header=False)

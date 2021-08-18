from pyspark.accumulators import AccumulatorParam


class ListAccumulator(AccumulatorParam):
    def zero(self, init_value: list):
        return init_value

    def addInPlace(self, v1: list, v2: list):
        return v1 + v2

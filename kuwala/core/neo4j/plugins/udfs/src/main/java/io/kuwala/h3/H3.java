package io.kuwala.h3;

import com.uber.h3core.*;
import org.neo4j.procedure.Description;
import org.neo4j.procedure.Name;
import org.neo4j.procedure.UserFunction;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class H3 {
    @UserFunction
    @Description("io.kuwala.h3.h3ToParent(h3Index, resolution) - Returns the parent index at a given resolution.")
    public String h3ToParent(
            @Name("h3Index") String h3Index,
            @Name("resolution") Long resolution
    ) throws IOException {
        H3Core h3 = H3Core.newInstance();

        return h3.h3ToParentAddress(h3Index, Math.toIntExact(resolution));
    }

    @UserFunction
    @Description("io.kuwala.h3.getNeighborsInRadius(h3Index, resolution, radius) - Returns the neighboring H3 indexes within a certain radius based on a given resolution.")
    public List<String> getNeighborsInRadius(
            @Name("h3Index") String h3Index,
            @Name("resolution") Long resolution,
            @Name("radius") Long radius
    ) throws IOException {
        H3Core h3 = H3Core.newInstance();
        String centerCell = transformIndexToResolution(h3Index, Math.toIntExact(resolution));
        List<String> edges = h3.getH3UnidirectionalEdgesFromHexagon(centerCell);
        Optional<Double> totalEdgeLength = edges.stream()
                .map(edge -> h3.exactEdgeLength(edge, LengthUnit.m))
                .reduce(Double::sum);

        if (totalEdgeLength.isPresent()) {
            double centerCellRadius = totalEdgeLength.get() / edges.size();

            if (centerCellRadius > radius) {
                throw new IllegalArgumentException();
            }

            int ringSize = Math.toIntExact((long) Math.ceil(Math.floor(radius / centerCellRadius) / 2));

            return h3.kRing(centerCell, ringSize);
        }

        throw new NullPointerException();
    }

    private String transformIndexToResolution(String h3Index, int resolution) throws IOException {
        H3Core h3 = H3Core.newInstance();
        int indexResolution = h3.h3GetResolution(h3Index);

        if (indexResolution < resolution) {
            return h3.h3ToCenterChild(h3Index, resolution);
        }

        if (indexResolution > resolution) {
            return h3.h3ToParentAddress(h3Index, resolution);
        }

        return h3Index;
    }
}



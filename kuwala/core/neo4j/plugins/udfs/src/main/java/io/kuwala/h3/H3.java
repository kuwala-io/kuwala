package io.kuwala.h3;

import com.uber.h3core.*;
import org.neo4j.procedure.Description;
import org.neo4j.procedure.Name;
import org.neo4j.procedure.UserFunction;

import java.io.IOException;

public class H3 {
    @UserFunction
    @Description("io.kuwala.h3.h3ToParent(h3Index, resolution) - Returns the parent index at a given resolution.")
    public String h3ToParent(
            @Name("h3Index") String h3Index,
            @Name("resolution") Long resolution
    ) {
        String parent = null;

        try {
            H3Core h3 = H3Core.newInstance();
            parent = h3.h3ToParentAddress(h3Index, Math.toIntExact(resolution));
        } catch (IOException e) {
            e.printStackTrace();
        }

        return parent;
    }
}



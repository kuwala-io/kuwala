import io.kuwala.h3.H3;
import org.hamcrest.MatcherAssert;
import org.junit.jupiter.api.*;
import org.neo4j.driver.*;
import org.neo4j.harness.Neo4j;
import org.neo4j.harness.Neo4jBuilders;

import static org.hamcrest.core.IsEqual.equalTo;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class H3Test {
    private static final Config driverConfig = Config.builder().withoutEncryption().build();
    private static Driver driver;
    private Neo4j embeddedDatabaseServer;

    @BeforeAll
    void initializeNeo4j() {
        this.embeddedDatabaseServer = Neo4jBuilders.newInProcessBuilder()
                .withDisabledServer()
                .withFunction(H3.class)
                .build();

        driver = GraphDatabase.driver(embeddedDatabaseServer.boltURI(), driverConfig);
    }

    @AfterAll
    void closeDriver() {
        driver.close();
        this.embeddedDatabaseServer.close();
    }

    @AfterEach
    void cleanDb() {
        try(Session session = driver.session()) {
            session.run("MATCH (n) DETACH DELETE n");
        }
    }

    @Test
    public void shouldReturnParentIndex() throws Throwable {
            Session session = driver.session();
            String result = session.run( "RETURN io.kuwala.h3.h3ToParent('8f3f3040004caca', 11) AS result").single().get("result").asString();

            MatcherAssert.assertThat( result, equalTo("8b3f3040004cfff") );
    }
}
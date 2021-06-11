## Setup

1. Create `jar`

```zsh
mvn clean install
```

2. Include `jar` in plugins folder of `dbmss` folder
3. Restart the database

## Usage

Reference the package directly in your Cypher query using `io.kuwala.h3`.

### h3ToParent
`io.kuwala.h3.h3ToParent(h3Index, resolution)` - Returns the parent index at a given resolution.

Example: 
```zsh
RETURN io.kuwala.h3.h3ToParent('8f3f3040004caca', 11) AS result
```


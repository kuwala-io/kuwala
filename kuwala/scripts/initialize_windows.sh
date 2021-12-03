mkdir windows
sed 's/\r$//' initialize_all_components.sh > ./windows/initialize_all_components.sh
sed 's/\r$//' build_cli.sh > ./windows/build_cli.sh
sed 's/\r$//' build_jupyter_notebook.sh > ./windows/build_jupyter_notebook.sh
sed 's/\r$//' build_neo4j.sh > ./windows/build_neo4j.sh
sed 's/\r$//' create_zip_archive.sh > ./windows/create_zip_archive.sh
sed 's/\r$//' initialize_core_components.sh > ./windows/initialize_core_components.sh
sed 's/\r$//' initialize_git_submodules.sh > ./windows/initialize_git_submodules.sh
sed 's/\r$//' run_cli.sh > ./windows/run_cli.sh
sed 's/\r$//' run_jupyter_notebook.sh > ./windows/run_jupyter_notebook.sh
sed 's/\r$//' stop_all_containers.sh > ./windows/stop_all_containers.sh
sed 's/\r$//' build_all_containers.sh > ./windows/build_all_containers.sh
cd windows
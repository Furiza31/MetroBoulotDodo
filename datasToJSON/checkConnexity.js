function checkConnexity(graph){
    n = graph.length;
    visited = Array(n).fill(false);

    function dfs(node){
        visited[node] = true;
        for(let i=0; i<n; i++){
            if(graph[node][i] != -1 && !visited[i]){
                dfs(i);
            }
        }
    }

    dfs(0);

    for(let i=0; i<n; i++){
        if(!visited[i]){
            return false;
        }
    }

    return true;
}

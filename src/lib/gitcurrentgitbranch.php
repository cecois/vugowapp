<?php
/**
 * based on Kevin Ridgway's currentgitbranch.php
 * @filename: gitcurrentgitbranch.php
 * @usage: Include this file, call getGit for the current branch string
 */

function getGitBranch(){

    $stringfromfile = file('../.git/HEAD', FILE_USE_INCLUDE_PATH);

    $stringfromfile = $stringfromfile[0]; //get the string from the array

    $explodedstring = explode("/", $stringfromfile); //seperate out by the "/" in the string

    $branchname = $explodedstring[2]; //get the one that is always the branch name

    return $branchname;
}

    ?>
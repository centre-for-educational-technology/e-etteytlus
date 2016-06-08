<?php
require('dbModels.php');

if (!isset($_GET['id']) ) {
  exit;
}

// Ensure authenticated and perform permissions check
session_start();

if ( !isset($_SESSION['current_user']) ) {
  exit('Authentication Error');
}

if ( (int) $_SESSION['current_user']->permissions !== permissions_conduct && (int) $_SESSION['current_user']->permissions !== permissions_admin ) {
  exit('Permission Error');
}

// Fetch data and fill the file
$columns = ['firstname', 'surname', 'email', 'date', 'faultyLetters', 'faultyWords', 'faultySentences', 'totalLetters', 'totalWords', 'totalSentences'];
$where = [
  'testId' => (int) $_GET['id']
];
$results = [];
$result = submission::db_select($columns, $where, $results);

$fp = fopen('php://memory', 'w');

fputcsv($fp, ['nimi', 'e-post', 'kuupäev', 'vigased tähemärgid', 'vigased sõnad', 'vigased laused', 'tähemärgid kokku', 'sõnad kokku', 'laused kokku', 'tulemus protsentides']);

if ( sizeof($results) > 0 ) {
  foreach($results as $single) {
    $fullname = $single->firstname . ' ' . $single->surname;
    $formatted_date = strftime('%d.%m.%Y %H:%M', $single->date);
    $percentage = floor( ($single->totalLetters - $single->faultyLetters) / $single->totalLetters * 100 );
    fputcsv($fp, [$fullname, $single->email, $formatted_date, $single->faultyLetters, $single->faultyWords, $single->faultySentences, $single->totalLetters, $single->totalWords, $single->totalSentences, $percentage ]);
  }
}


rewind($fp);

header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="test_' . $_GET['id'] . '_submissions.csv";');
fpassthru($fp);
fclose($fp);
exit;

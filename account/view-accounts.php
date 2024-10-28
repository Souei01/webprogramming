<?php
session_start();

// Check if the user is logged in and has the necessary permissions
if (!isset($_SESSION['account']) || !$_SESSION['account']['is_admin']) {
    // Redirect to a forbidden page or show a forbidden message
    header('HTTP/1.0 403 Forbidden');
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forbidden</title>
    </head>
    <body>
        <h1>Forbidden</h1>
        <p>You don\'t have permission to access this resource.</p>
        <hr>
        <address>Apache/2.4.41 (Ubuntu) Server at beta.example.com Port 80</address>
    </body>
    </html>';
    exit;
}

require_once '../classes/account.class.php';

$accountObj = new Account();
$accounts = $accountObj->getAllAccounts(); // Assuming getAllAccounts() method exists to get all accounts

?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <h4 class="page-title">Accounts</h4>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="table-accounts" class="table table-centered table-nowrap mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="text-start">No.</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Is Staff</th>
                                    <th>Is Admin</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                $i = 1;
                                foreach ($accounts as $account) {
                                ?>
                                    <tr>
                                        <td class="text-start"><?= $i ?></td>
                                        <td><?= htmlspecialchars($account['first_name']) ?></td>
                                        <td><?= htmlspecialchars($account['last_name']) ?></td>
                                        <td><?= htmlspecialchars($account['username']) ?></td>
                                        <td><?= htmlspecialchars($account['role']) ?></td>
                                        <td><?= $account['is_staff'] ? 'Yes' : 'No' ?></td>
                                        <td><?= $account['is_admin'] ? 'Yes' : 'No' ?></td>
                                        <td class="text-nowrap">
                                            <a href="editaccount.php?id=<?= $account['id'] ?>" class="btn btn-sm btn-outline-success me-1">Edit</a>
                                            <?php if (isset($_SESSION['account']['is_admin']) && $_SESSION['account']['is_admin']) { ?>
                                                <button class="btn btn-sm btn-outline-danger deleteBtn" data-id="<?= $account['id'] ?>" data-name="<?= htmlspecialchars($account['username']) ?>">Delete</button>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                <?php
                                    $i++;
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // JavaScript for handling delete button clicks
    document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            let username = this.dataset.name;
            let accountId = this.dataset.id;
            let response = confirm("Do you want to delete the account " + username + "?");
            if (response) {
                fetch('deleteaccount.php?id=' + accountId, {
                    method: 'GET'
                })
                .then(response => response.text())
                .then(data => {
                    if(data === 'success') {
                        location.reload();
                    }
                });
            }
        });
    });
</script>


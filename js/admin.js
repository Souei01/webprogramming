$(document).ready(function(){
    function loadContentBasedOnURL() {
        let url = window.location.href;
        if (url.endsWith('dashboard')) {
            viewAnalytics();
        } else if (url.endsWith('products')) {
            viewProducts();
        } else if (url.endsWith('view-accounts')) {
            viewAccounts();
        }
    }

    $('.nav-link').on('click', function(e){
        e.preventDefault();
        $('.nav-link').removeClass('link-active');
        $(this).addClass('link-active');
        
        let url = $(this).attr('href');
        window.history.pushState({path: url}, '', url);

        loadContentBasedOnURL();
    });

    window.onpopstate = function(event) {
        if (event.state) {
            loadContentBasedOnURL();
        }
    };

    loadContentBasedOnURL(); // Load content based on URL when the page is first loaded

    function viewAnalytics(){
        $.ajax({
            type: 'GET',
            url: 'view-analytics.php',
            dataType: 'html',
            success: function(response){
                $('.content-page').html(response);
                loadChart();
            }
        });
    }

    function loadChart(){
        const ctx = document.getElementById('salesChart').getContext('2d');
        const salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            datasets: [{
            label: 'Sales',
            data: [7000, 5500, 5000, 4000, 4500, 6500, 8200, 8500, 9200, 9600, 10000, 9800],
            backgroundColor: '#EE4C51',
            borderColor: '#EE4C51',
            borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
            y: {
                beginAtZero: true,
                max: 10000,
                ticks: {
                    stepSize: 2000  // Set step size to 2000
                }
            }
            }
        }
        });
    }

    function viewProducts(){
        $.ajax({
            type: 'GET',
            url: '../products/view-products.php',
            dataType: 'html',
            success: function(response){
                $('.content-page').html(response);

                var table = $('#table-products').DataTable({
                    dom: 'rtp',
                    pageLength: 10,
                    ordering: false,
                });

                $('#custom-search').on('keyup', function() {
                    table.search(this.value).draw();
                });

                $('#category-filter').on('change', function() {
                    if(this.value !== 'choose'){
                        table.column(3).search(this.value).draw();
                    }
                });

                // Update the click handler
                $(document).on('click', '#add-product', function(e){
                    e.preventDefault();
                    addProduct();
                });
            }
        });
    }


    function viewAccounts(){
        $.ajax({
            type: 'GET',
            url: '../admin/view-accounts.php',
            dataType: 'html',
            success: function(response){
                $('.content-page').html(response);
            }
        });
    }

    function addProduct(){
        console.log('Add Product clicked');
        $.ajax({
            type: 'GET',
            url: '../products/add-product.html',
            dataType: 'html',
            success: function(view){
                console.log('Modal HTML loaded');
                $('.modal-container').html(view);
                
                var myModal = new bootstrap.Modal(document.getElementById('modal-add-product'), {
                    keyboard: false,
                    backdrop: 'static'
                });
                myModal.show();

                fetchCategories();

                // Add file input change handler
                $('#product_image').on('change', function() {
                    const fileInput = this;
                    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                    const errorElement = $('#file-size-error');
                    
                    if (fileInput.files.length > 0) {
                        const fileSize = fileInput.files[0].size;
                        if (fileSize > maxSize) {
                            // Show error message
                            errorElement.text('Error: File size exceeds 5MB limit. Please choose a smaller file.').show();
                            // Clear the file input
                            fileInput.value = '';
                            $(fileInput).addClass('is-invalid');
                        } else {
                            // Clear error message if file size is acceptable
                            errorElement.hide();
                            $(fileInput).removeClass('is-invalid');
                        }
                    }
                });

                $('#form-add-product').on('submit', function(e){
                    e.preventDefault();
                    saveProduct();
                });
            },
            error: function(xhr, status, error) {
                console.error('Ajax error:', error);
            }
        });
    }

    function saveProduct(){
        let formData = new FormData($('#form-add-product')[0]);
        
        // Check file size before upload
        let fileInput = $('#product_image')[0];
        if (fileInput.files.length > 0) {
            let fileSize = fileInput.files[0].size;
            let maxSize = 5 * 1024 * 1024; // 5MB in bytes
            
            if (fileSize > maxSize) {
                $('#file-size-error').text('Error: File size exceeds 5MB limit. Please choose a smaller file.').show();
                $('#product_image').addClass('is-invalid');
                return false;
            }
        }
        
        $.ajax({
            type: 'POST',
            url: '../products/add-product.php',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'error') {
                    // Handle other validation errors
                    if (response.codeErr) {
                        $('#code').addClass('is-invalid');
                        $('#code').next('.invalid-feedback').text(response.codeErr).show();
                    } else {
                        $('#code').removeClass('is-invalid');
                    }
                    if (response.nameErr) {
                        $('#name').addClass('is-invalid');
                        $('#name').next('.invalid-feedback').text(response.nameErr).show();
                    } else {
                        $('#name').removeClass('is-invalid');
                    }
                    if (response.categoryErr) {
                        $('#category').addClass('is-invalid');
                        $('#category').next('.invalid-feedback').text(response.categoryErr).show();
                    } else {
                        $('#category').removeClass('is-invalid');
                    }
                    if (response.priceErr) {
                        $('#price').addClass('is-invalid');
                        $('#price').next('.invalid-feedback').text(response.priceErr).show();
                    } else {
                        $('#price').removeClass('is-invalid');
                    }
                    if (response.imageErr) {
                        $('#product_image').addClass('is-invalid');
                        $('#file-size-error').text(response.imageErr).show();
                    } else {
                        $('#product_image').removeClass('is-invalid');
                        $('#file-size-error').hide();
                    }
                } else if (response.status === 'success') {
                    var modalElement = document.getElementById('modal-add-product');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();
                    
                    $('#form-add-product')[0].reset();
                    viewProducts();
                }
            },
            error: function(xhr, status, error) {
                console.error('Upload error:', error);
                $('#file-size-error').text('An error occurred while uploading the file. Please try again.').show();
            }
        });
    }

    function fetchCategories(){
        $.ajax({
            url: '../products/fetch-categories.php',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                $('#category').empty().append('<option value="">--Select--</option>');
                $.each(data, function(index, category) {
                    $('#category').append(
                        $('<option>', {
                            value: category.id,
                            text: category.name
                        })
                    );
                });
            }
        });
    }
});

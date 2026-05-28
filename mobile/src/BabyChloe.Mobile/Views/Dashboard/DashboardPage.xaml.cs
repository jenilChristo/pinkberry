using BabyChloe.Mobile.ViewModels.Dashboard;

namespace BabyChloe.Mobile.Views.Dashboard;

public partial class DashboardPage : ContentPage
{
    public DashboardPage(DashboardViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
using BabyChloe.Mobile.ViewModels.Activity;

namespace BabyChloe.Mobile.Views.Activity;

public partial class ActivityFeedPage : ContentPage
{
    public ActivityFeedPage(ActivityFeedViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["api/src/BabyChloe.Api/BabyChloe.Api.csproj", "api/src/BabyChloe.Api/"]
COPY ["api/src/BabyChloe.Application/BabyChloe.Application.csproj", "api/src/BabyChloe.Application/"]
COPY ["api/src/BabyChloe.Domain/BabyChloe.Domain.csproj", "api/src/BabyChloe.Domain/"]
COPY ["api/src/BabyChloe.Infrastructure/BabyChloe.Infrastructure.csproj", "api/src/BabyChloe.Infrastructure/"]
RUN dotnet restore "api/src/BabyChloe.Api/BabyChloe.Api.csproj"
COPY . .
WORKDIR "/src/api/src/BabyChloe.Api"
RUN dotnet build "BabyChloe.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BabyChloe.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BabyChloe.Api.dll"]

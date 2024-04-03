#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dependencies

# Install NodeJS
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && rm -rf /var/lib/apt/lists/*
ARG NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install nodejs -y \
    && rm -rf /var/lib/apt/lists/*

FROM dependencies AS build
    
WORKDIR /src
COPY ["ProjectSelene/ProjectSelene.csproj", "ProjectSelene/"]
RUN dotnet restore "ProjectSelene/ProjectSelene.csproj"
COPY ["ProjectSelene.Modloader/package.json", "ProjectSelene.Modloader/package-lock.json", "ProjectSelene.Modloader/"]
RUN cd ProjectSelene.Modloader && npm ci
COPY . .
WORKDIR "/src/ProjectSelene"
RUN dotnet build "ProjectSelene.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ProjectSelene.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["/app/ProjectSelene"]